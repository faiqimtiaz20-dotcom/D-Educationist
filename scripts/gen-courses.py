import json
import random
import os

random.seed(42)

countries = ['Australia', 'Canada', 'UK', 'Singapore', 'Hungary', 'Germany', 'USA']
levels = ['Post Graduation', 'Under Graduation', 'PHD', 'Diploma']
course_names = [
    'MBA', 'MCOM', 'BBA', 'MS Computer Science', 'PHD Business', 'Diploma IT',
    'BSc Nursing', 'MSc Data Science', 'BA Psychology', 'LLM', 'MEng Civil',
    'BCom Accounting', 'MSc Biotechnology', 'BArch', 'MA International Relations',
]
intakes = ['Jan-2026', 'Apr-2026', 'Jul-2026', 'Nov-2026', 'Sep-2026']
university_prefixes = [
    'Global', 'Metropolitan', 'Pacific', 'Northern', 'Central', 'Royal', 'State',
    'National', 'International', 'City',
]

courses = []
for i in range(200):
    country = countries[i % len(countries)]
    level = levels[i % len(levels)]
    course = course_names[i % len(course_names)]
    intake = intakes[i % len(intakes)]
    uni_idx = (i // len(countries)) % len(university_prefixes)
    university = f"{university_prefixes[uni_idx]} University of {country.split()[0]}"
    duration_years = 1 + (i % 4)
    tuition = 12000 + (i % 20) * 2500 + (i % 7) * 500

    courses.append({
        'id': f'c{i + 1}',
        'country': country,
        'university': university,
        'course': course,
        'level': level,
        'intake': intake,
        'duration': f'{duration_years} year{"s" if duration_years > 1 else ""}',
        'tuition': f'${tuition:,}/yr',
    })

out_dir = os.path.join(os.path.dirname(__file__), '..', 'src', 'mocks', 'data')
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, 'courses.json')

with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(courses, f, indent=2)

print(f'Generated {len(courses)} courses -> {out_path}')
