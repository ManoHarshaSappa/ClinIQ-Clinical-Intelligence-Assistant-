"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { searchPatients, SearchResult } from "@/lib/api";
import { Search, History, Bookmark, Filter, SortAsc, Download, Clock, Star, Calendar, FileText, TrendingUp, Users, BarChart3, Eye, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSpecialtyBg, getSpecialtyBorder, cn } from "@/lib/utils";

interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
}

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: SearchFilters;
  timestamp: Date;
}

interface SearchFilters {
  specialty: string;
  dateRange: {
    start?: Date;
    end?: Date;
  };
  fileTypes: string[];
  similarity: number;
  sortBy: 'relevance' | 'date' | 'name' | 'specialty';
  sortOrder: 'asc' | 'desc';
}

interface SearchSuggestion {
  text: string;
  type: 'history' | 'suggestion' | 'patient';
  count?: number;
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Advanced search state
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [bookmarkedPatients, setBookmarkedPatients] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    specialty: "all",
    dateRange: {},
    fileTypes: [],
    similarity: 70,
    sortBy: 'relevance',
    sortOrder: 'desc'
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchStats, setSearchStats] = useState({
    totalSearches: 0,
    averageResults: 0,
    mostSearchedTerms: [] as { term: string; count: number }[]
  });
  const [realTimeSearch, setRealTimeSearch] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout>();

  // Load saved data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    const savedBookmarks = localStorage.getItem('bookmarkedPatients');
    const savedSearchesList = localStorage.getItem('savedSearches');
    const savedStats = localStorage.getItem('searchStats');

    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
    if (savedBookmarks) setBookmarkedPatients(JSON.parse(savedBookmarks));
    if (savedSearchesList) setSavedSearches(JSON.parse(savedSearchesList));
    if (savedStats) setSearchStats(JSON.parse(savedStats));
  }, []);

  // Generate search suggestions
  const generateSuggestions = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return [];

    const historySuggestions: SearchSuggestion[] = searchHistory
      .filter(h => h.query.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3)
      .map(h => ({
        text: h.query,
        type: 'history',
        count: h.resultsCount
      }));

    const commonSuggestions: SearchSuggestion[] = [
      { text: `${searchQuery} symptoms`, type: 'suggestion' as const },
      { text: `${searchQuery} treatment`, type: 'suggestion' as const },
      { text: `${searchQuery} medication`, type: 'suggestion' as const },
      { text: `patients with ${searchQuery}`, type: 'suggestion' as const }
    ].filter(s => s.text.toLowerCase() !== searchQuery.toLowerCase());

    return [...historySuggestions, ...commonSuggestions.slice(0, 4)];
  }, [searchHistory]);

  // Real-time search with debouncing
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !realTimeSearch) return;

    setIsLoading(true);
    try {
      const res = await searchPatients(searchQuery.trim());
      setResults(res.results);
      setSearched(true);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [realTimeSearch]);

  // Handle input change with suggestions and real-time search
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Generate suggestions
    const newSuggestions = generateSuggestions(value);
    setSuggestions(newSuggestions);
    setShowSuggestions(value.length > 0 && newSuggestions.length > 0);

    // Set up real-time search
    if (realTimeSearch && value.trim().length > 2) {
      const timeout = setTimeout(() => debouncedSearch(value), 500);
      setSearchTimeout(timeout);
    }
  }, [searchTimeout, generateSuggestions, realTimeSearch, debouncedSearch]);

  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    if (!queryToSearch.trim()) return;

    setIsLoading(true);
    setSearched(false);
    setShowSuggestions(false);

    try {
      const res = await searchPatients(queryToSearch.trim());
      const filteredResults = applyFilters(res.results);
      setResults(filteredResults);

      // Add to search history
      const historyEntry: SearchHistory = {
        id: Date.now().toString(),
        query: queryToSearch.trim(),
        timestamp: new Date(),
        resultsCount: filteredResults.length
      };

      const newHistory = [historyEntry, ...searchHistory.slice(0, 19)]; // Keep last 20
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));

      // Update stats
      const newStats = {
        totalSearches: searchStats.totalSearches + 1,
        averageResults: Math.round((searchStats.averageResults * searchStats.totalSearches + filteredResults.length) / (searchStats.totalSearches + 1)),
        mostSearchedTerms: updateMostSearchedTerms(queryToSearch.trim())
      };
      setSearchStats(newStats);
      localStorage.setItem('searchStats', JSON.stringify(newStats));

    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
      setSearched(true);
    }
  };

  // Apply advanced filters to results
  const applyFilters = useCallback((rawResults: SearchResult[]) => {
    let filtered = [...rawResults];

    // Filter by specialty
    if (filters.specialty !== "all") {
      filtered = filtered.filter(r => (r.patient_specialty ?? "Unknown") === filters.specialty);
    }

    // Filter by similarity threshold
    filtered = filtered.filter(r => Math.round(r.similarity * 100) >= filters.similarity);

    // Filter by file types
    if (filters.fileTypes.length > 0) {
      // This would need backend support to filter by file types
    }

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'relevance':
          comparison = b.similarity - a.similarity;
          break;
        case 'name':
          comparison = a.patient_name.localeCompare(b.patient_name);
          break;
        case 'specialty':
          comparison = (a.patient_specialty || '').localeCompare(b.patient_specialty || '');
          break;
        case 'date':
          // This would need backend support for actual dates
          comparison = a.patient_name.localeCompare(b.patient_name);
          break;
        default:
          comparison = 0;
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [filters]);

  // Update most searched terms
  const updateMostSearchedTerms = useCallback((term: string) => {
    const existing = searchStats.mostSearchedTerms.find(t => t.term === term);
    if (existing) {
      existing.count++;
      return searchStats.mostSearchedTerms.sort((a, b) => b.count - a.count);
    } else {
      return [...searchStats.mostSearchedTerms, { term, count: 1 }]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Keep top 10
    }
  }, [searchStats.mostSearchedTerms]);

  // Save search functionality
  const saveSearch = useCallback((name: string) => {
    const savedSearch: SavedSearch = {
      id: Date.now().toString(),
      name,
      query,
      filters: { ...filters },
      timestamp: new Date()
    };

    const newSavedSearches = [savedSearch, ...savedSearches];
    setSavedSearches(newSavedSearches);
    localStorage.setItem('savedSearches', JSON.stringify(newSavedSearches));
  }, [query, filters, savedSearches]);

  // Bookmark functionality
  const toggleBookmark = useCallback((patientId: string) => {
    const newBookmarks = bookmarkedPatients.includes(patientId)
      ? bookmarkedPatients.filter(id => id !== patientId)
      : [...bookmarkedPatients, patientId];

    setBookmarkedPatients(newBookmarks);
    localStorage.setItem('bookmarkedPatients', JSON.stringify(newBookmarks));
  }, [bookmarkedPatients]);

  // Export results
  const exportResults = useCallback(() => {
    const exportData = {
      query,
      timestamp: new Date().toISOString(),
      filters,
      results: filteredResults.map(r => ({
        patient_name: r.patient_name,
        patient_specialty: r.patient_specialty,
        similarity: Math.round(r.similarity * 100),
        content: r.chunk_text,
        patient_id: r.patient_id
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [query, filters, results]);

  // Computed values
  const specialties = useMemo(() =>
    ["all", ...Array.from(new Set(results.map((r) => r.patient_specialty ?? "Unknown")))],
    [results]
  );

  const filteredResults = useMemo(() =>
    applyFilters(results),
    [results, applyFilters]
  );

  const recentSearches = useMemo(() =>
    searchHistory.slice(0, 5),
    [searchHistory]
  );

  // Highlight search terms in text
  const highlightText = useCallback((text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ?
        `<mark class="bg-yellow-200 px-1 rounded">${part}</mark>` :
        part
    ).join('');
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header with Analytics */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Advanced Clinical Search</h1>
            <p className="text-slate-500 mt-1">Intelligent search across all patient records with AI-powered insights.</p>
          </div>
          <div className="flex items-center gap-4">
            {searchStats.totalSearches > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{searchStats.totalSearches}</div>
                <div className="text-xs text-slate-500">Total Searches</div>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRealTimeSearch(!realTimeSearch)}
              className={cn("text-xs", realTimeSearch && "bg-blue-50 text-blue-700")}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Real-time Search {realTimeSearch ? 'ON' : 'OFF'}
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Search Bar with Suggestions */}
      <div className="relative mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              placeholder='e.g. "patients with diabetes on Metformin", "cardiac surgery complications"'
              className="pl-12 pr-4 py-3 bg-white text-sm border-2 border-slate-200 hover:border-blue-300 focus:border-blue-500 rounded-xl"
            />

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-64 overflow-y-auto">
                <div className="p-2">
                  <div className="text-xs font-medium text-slate-500 px-3 py-2">SUGGESTIONS</div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setQuery(suggestion.text);
                        handleSearch(suggestion.text);
                        setShowSuggestions(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 flex items-center gap-3"
                    >
                      <div className="flex-shrink-0">
                        {suggestion.type === 'history' ? (
                          <History className="w-4 h-4 text-slate-400" />
                        ) : (
                          <Search className="w-4 h-4 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-slate-700 truncate">{suggestion.text}</div>
                        {suggestion.count && (
                          <div className="text-xs text-slate-400">{suggestion.count} results</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Searching...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </div>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="rounded-xl"
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Searches
            </h3>
            {recentSearches.length > 0 ? (
              <div className="space-y-2">
                {recentSearches.map((search) => (
                  <button
                    key={search.id}
                    onClick={() => {
                      setQuery(search.query);
                      handleSearch(search.query);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    <div className="truncate">{search.query}</div>
                    <div className="text-xs text-slate-400">{search.resultsCount} results</div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No recent searches</p>
            )}
          </div>

          {/* Bookmarks */}
          {bookmarkedPatients.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Bookmarked Patients
              </h3>
              <div className="text-sm text-blue-600">
                {bookmarkedPatients.length} patients bookmarked
              </div>
            </div>
          )}

          {/* Saved Searches */}
          {savedSearches.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Saved Searches
              </h3>
              <div className="space-y-2">
                {savedSearches.slice(0, 3).map((saved) => (
                  <button
                    key={saved.id}
                    onClick={() => {
                      setQuery(saved.query);
                      setFilters(saved.filters);
                      handleSearch(saved.query);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
                  >
                    <div className="font-medium truncate">{saved.name}</div>
                    <div className="text-xs text-slate-400 truncate">{saved.query}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Analytics */}
          {searchStats.mostSearchedTerms.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Popular Terms
              </h3>
              <div className="space-y-2">
                {searchStats.mostSearchedTerms.slice(0, 5).map((term) => (
                  <button
                    key={term.term}
                    onClick={() => {
                      setQuery(term.term);
                      handleSearch(term.term);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                  >
                    <span className="truncate">{term.term}</span>
                    <span className="text-xs text-slate-400 ml-2">{term.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="col-span-12 lg:col-span-9">
          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">Advanced Filters</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters({
                    specialty: "all",
                    dateRange: {},
                    fileTypes: [],
                    similarity: 70,
                    sortBy: 'relevance',
                    sortOrder: 'desc'
                  })}
                >
                  Reset Filters
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Specialty Filter */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Specialty</label>
                  <select
                    value={filters.specialty}
                    onChange={(e) => setFilters({...filters, specialty: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  >
                    {specialties.map((s) => (
                      <option key={s} value={s}>
                        {s === "all" ? `All Specialties` : s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Similarity Threshold */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Min. Relevance: {filters.similarity}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.similarity}
                    onChange={(e) => setFilters({...filters, similarity: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                  <div className="flex gap-2">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="name">Patient Name</option>
                      <option value="specialty">Specialty</option>
                      <option value="date">Date</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilters({
                        ...filters,
                        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
                      })}
                      className="px-3"
                    >
                      <SortAsc className={cn("w-4 h-4", filters.sortOrder === 'desc' && "rotate-180")} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Header */}
          {(searched || results.length > 0) && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-slate-800">
                  Search Results ({filteredResults.length})
                </h2>
                {query && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const name = prompt('Enter a name for this search:');
                      if (name) saveSearch(name);
                    }}
                    className="text-xs"
                  >
                    <Bookmark className="w-3 h-3 mr-1" />
                    Save Search
                  </Button>
                )}
              </div>

              {filteredResults.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportResults}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export Results
                </Button>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600 font-medium">Searching patient records...</p>
              <p className="text-sm text-slate-400 mt-2">Using AI to find the most relevant matches</p>
            </div>
          )}

          {/* No Results */}
          {!isLoading && searched && filteredResults.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No matching records found</h3>
              <p className="text-slate-500 mb-4">
                No results for <strong>"{query}"</strong> with current filters
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setFilters({...filters, similarity: Math.max(0, filters.similarity - 20)})}
                  disabled={filters.similarity <= 20}
                >
                  Lower Relevance Threshold
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(true)}
                >
                  Adjust Filters
                </Button>
              </div>
            </div>
          )}

          {/* Enhanced Results */}
          {filteredResults.length > 0 && (
            <div className="space-y-4">
              {filteredResults.map((r) => (
                <div
                  key={r.id}
                  className={cn(
                    "bg-white rounded-xl border border-l-4 p-6 hover:shadow-lg transition-all group",
                    getSpecialtyBorder(r.patient_specialty)
                  )}
                >
                  <div className="flex items-start gap-4">
                    {/* Patient Avatar */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 flex-shrink-0",
                      getSpecialtyBg(r.patient_specialty)
                    )}>
                      {r.patient_name.charAt(0)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/patients/${r.patient_id}`}
                            className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                          >
                            {r.patient_name}
                          </Link>

                          {r.patient_specialty && (
                            <span className={cn(
                              "text-xs px-3 py-1 rounded-full border font-medium",
                              getSpecialtyBg(r.patient_specialty)
                            )}>
                              {r.patient_specialty}
                            </span>
                          )}

                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <TrendingUp className="w-3 h-3" />
                            {Math.round(r.similarity * 100)}% match
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(r.patient_id)}
                            className={cn(
                              "p-1",
                              bookmarkedPatients.includes(r.patient_id) && "text-yellow-600"
                            )}
                          >
                            <Star className="w-4 h-4" />
                          </Button>

                          <Link href={`/patients/${r.patient_id}`}>
                            <Button variant="ghost" size="sm" className="p-1">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Highlighted Content Preview */}
                      <div className="text-sm text-slate-600 leading-relaxed">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: highlightText(r.chunk_text, query)
                          }}
                        />
                      </div>

                      {/* Tags and Metadata */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Medical Record
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Patient ID: {r.patient_id.slice(-8)}
                        </div>
                        {bookmarkedPatients.includes(r.patient_id) && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="w-3 h-3 fill-current" />
                            Bookmarked
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Discovery Section */}
          {!searched && !isLoading && (
            <div className="space-y-6">
              {/* Smart Search Examples */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Search className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-semibold text-slate-800">Smart Search Examples</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: "Patients with diabetes on Metformin", icon: "🩸", category: "Endocrinology" },
                    { label: "Allergy to penicillin or beta-lactam", icon: "⚠️", category: "Allergies" },
                    { label: "Post-surgical complications", icon: "🔬", category: "Surgery" },
                    { label: "Heart failure with reduced EF", icon: "❤️", category: "Cardiology" },
                    { label: "Lung cancer staging and treatment", icon: "🧬", category: "Oncology" },
                    { label: "Chronic kidney disease dialysis", icon: "🫘", category: "Nephrology" },
                    { label: "Bipolar disorder medication history", icon: "🧠", category: "Psychiatry" },
                    { label: "Elevated PSA follow-up", icon: "🔬", category: "Urology" },
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={() => {
                        setQuery(s.label);
                        handleSearch(s.label);
                      }}
                      className="flex items-start gap-3 p-4 text-left bg-white rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group"
                    >
                      <span className="text-xl mt-1">{s.icon}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors">
                          {s.label}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{s.category}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-purple-600" />
                  Search Tips
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <strong>Natural Language:</strong> Search like you're talking to a colleague
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <strong>Medical Terms:</strong> Use specific diagnoses, medications, or procedures
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <strong>Combinations:</strong> Search for multiple conditions or treatments
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <strong>Filters:</strong> Use advanced filters to narrow results
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Popular Quick Searches */}
              {searchStats.mostSearchedTerms.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Trending Searches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {searchStats.mostSearchedTerms.slice(0, 8).map((term) => (
                      <button
                        key={term.term}
                        onClick={() => {
                          setQuery(term.term);
                          handleSearch(term.term);
                        }}
                        className="px-4 py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-full text-sm border border-slate-200 hover:border-blue-300 transition-all flex items-center gap-2"
                      >
                        {term.term}
                        <span className="text-xs text-slate-400">({term.count})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Get Started Message */}
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Advanced Clinical Intelligence</h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  Start typing to search across all patient records using natural language.
                  Our AI understands medical terminology and finds the most relevant matches.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
