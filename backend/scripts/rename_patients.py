"""Assign real unique names to all Sample Patient / Unknown / ABC patients."""
import os, sys, random
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv; load_dotenv()
from db.supabase import get_supabase

FIRST_NAMES_MALE = [
    "James", "William", "Robert", "Michael", "David", "Richard", "Joseph",
    "Thomas", "Charles", "Christopher", "Daniel", "Matthew", "Anthony",
    "Donald", "Mark", "Paul", "Steven", "Andrew", "Kenneth", "Joshua",
    "Kevin", "Brian", "George", "Timothy", "Ronald", "Edward", "Jason",
    "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas", "Eric", "Jonathan",
    "Stephen", "Larry", "Justin", "Scott", "Brandon", "Raymond",
    "Arjun", "Mohammed", "Wei", "Carlos", "Diego", "Luca", "Omar",
    "Raj", "Ivan", "Yusuf", "Aiden", "Ethan", "Noah", "Logan", "Mason",
]

FIRST_NAMES_FEMALE = [
    "Mary", "Patricia", "Jennifer", "Linda", "Barbara", "Elizabeth",
    "Susan", "Jessica", "Sarah", "Karen", "Lisa", "Nancy", "Betty",
    "Margaret", "Sandra", "Ashley", "Dorothy", "Kimberly", "Emily",
    "Donna", "Michelle", "Carol", "Amanda", "Melissa", "Deborah",
    "Stephanie", "Rebecca", "Sharon", "Laura", "Cynthia", "Kathleen",
    "Amy", "Angela", "Shirley", "Anna", "Brenda", "Pamela", "Emma",
    "Nicole", "Helen", "Samantha", "Katherine", "Christine", "Debra",
    "Priya", "Fatima", "Sofia", "Mei", "Aisha", "Elena", "Zara",
    "Aaliyah", "Nadia", "Isabella", "Olivia", "Ava", "Mia", "Luna",
]

LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
    "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
    "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
    "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
    "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts", "Patel", "Kim", "Chen", "Singh", "Sharma",
    "Murphy", "Cook", "Rogers", "Morgan", "Cooper", "Reed", "Bailey",
    "Bell", "Gomez", "Kelly", "Howard", "Ward", "Cox", "Diaz", "Richardson",
    "Wood", "Watson", "Brooks", "Bennett", "Gray", "James", "Reyes",
    "Hughes", "Price", "Myers", "Hamilton", "Graham", "Sullivan", "Foster",
]

def generate_unique_names(count: int, used: set) -> list:
    names = []
    attempts = 0
    while len(names) < count and attempts < 5000:
        attempts += 1
        gender = random.choice(["male", "female"])
        first = random.choice(FIRST_NAMES_MALE if gender == "male" else FIRST_NAMES_FEMALE)
        last = random.choice(LAST_NAMES)
        full = f"{first} {last}"
        if full not in used:
            used.add(full)
            names.append(full)
    return names

def rename():
    sb = get_supabase()
    all_patients = sb.table("patients").select("id, name, gender").execute().data

    # Find patients needing rename
    to_rename = [
        p for p in all_patients
        if not p["name"]
        or "Sample Patient" in str(p["name"])
        or p["name"] in ["ABC", "Unknown Patient", "Unknown"]
    ]

    # Collect existing real names so we don't duplicate
    existing_names = {
        p["name"] for p in all_patients
        if p["name"] and "Sample Patient" not in p["name"]
        and p["name"] not in ["ABC", "Unknown Patient", "Unknown"]
    }

    new_names = generate_unique_names(len(to_rename), existing_names)

    print(f"Renaming {len(to_rename)} patients...\n")

    for i, patient in enumerate(to_rename):
        new_name = new_names[i]
        sb.table("patients").update({"name": new_name}).eq("id", patient["id"]).execute()
        print(f"  {patient['name'] or 'None':<25} → {new_name}")

    print(f"\nDone. {len(to_rename)} patients renamed.")

if __name__ == "__main__":
    rename()
