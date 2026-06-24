import pandas as pd
import numpy as np
import json
import os

excel_path = r"มอบตัว69 (1).xlsx"
dest_dir = r"assets/js"
data_js_path = os.path.join(dest_dir, "data.js")

# 1. Read existing assignments and preserve STAFF_DATA from data.js
existing_assignments = {}
staff_data_content = ""

if os.path.exists(data_js_path):
    try:
        with open(data_js_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # Extract STUDENT_DATA
            start_idx = content.find("STUDENT_DATA = ")
            if start_idx != -1:
                start_idx += len("STUDENT_DATA = ")
                # Find the first semicolon immediately ending STUDENT_DATA
                end_idx = content.find(";", start_idx)
                if end_idx != -1:
                    json_str = content[start_idx:end_idx].strip()
                    students = json.loads(json_str)
                    for row in students:
                        sid = int(row[0])
                        session_id = int(row[6])
                        team_id = int(row[7])
                        existing_assignments[sid] = (session_id, team_id)
                    print(f"Loaded {len(existing_assignments)} existing stable assignments from data.js")
            
            # Extract and preserve STAFF_DATA
            staff_idx = content.find("const STAFF_DATA")
            if staff_idx != -1:
                staff_data_content = content[staff_idx:].strip()
                print("Successfully preserved STAFF_DATA content.")
    except Exception as e:
        print(f"Warning: Could not read existing data.js: {e}")

# If no STAFF_DATA was preserved, initialize an empty one
if not staff_data_content:
    staff_data_content = "const STAFF_DATA = [];\n"

# 2. Read new Excel sheet
if not os.path.exists(excel_path):
    print(f"Excel file not found at: {excel_path}")
    exit(1)

df = pd.read_excel(excel_path)
df = df.fillna("")
print("Loaded excel. Shape:", df.shape)

# Filter and validate rows, skipping empty rows and headers/footers
valid_rows = []
for idx, row in df.iterrows():
    sid_val = str(row.get('id_student', '')).strip()
    if not sid_val or sid_val == "":
        continue
    try:
        # Handle float strings (e.g. 6930100013.0) safely by converting to float first
        sid = int(float(sid_val))
        valid_rows.append((idx, sid, row))
    except ValueError:
        print(f"Skipping invalid student ID row at index {idx}: {sid_val}")
        continue

print(f"Identified {len(valid_rows)} valid student rows from Excel.")

# Count initial team distributions (8 slots: session 0/1 and team 0/1/2/3)
distribution = {}
for s in [0, 1]:
    for t in [0, 1, 2, 3]:
        distribution[(s, t)] = 0

# Populate distribution with existing assignments that are still present in Excel
for idx, sid, row in valid_rows:
    if sid in existing_assignments:
        s_id, t_id = existing_assignments[sid]
        distribution[(s_id, t_id)] += 1

# 3. Identify and assign new students
new_students = []
for idx, sid, row in valid_rows:
    if sid not in existing_assignments:
        new_students.append((idx, sid, row))

print(f"Found {len(new_students)} new students to assign groups to.")

# Shuffle new students to randomize their assignment order for fairness (keep stable seed)
np.random.seed(42)
np.random.shuffle(new_students)

# Assign new students to keep sessions and teams balanced
for idx, sid, row in new_students:
    # 1. Determine target session (Morning vs Afternoon) with lower count
    morning_count = sum(distribution[(0, t)] for t in range(4))
    afternoon_count = sum(distribution[(1, t)] for t in range(4))
    
    if morning_count <= afternoon_count:
        target_session = 0
    else:
        target_session = 1
        
    # 2. Determine target team within that session with lowest count
    min_team = 0
    min_val = 999999
    for t in range(4):
        val = distribution[(target_session, t)]
        if val < min_val:
            min_val = val
            min_team = t
            
    # Assign and update distribution
    existing_assignments[sid] = (target_session, min_team)
    distribution[(target_session, min_team)] += 1

# 4. Generate sorted student list to write to JS
students_list = []
for idx, sid, row in valid_rows:
    prefix = str(row.get('คำนำหน้า', '')).strip()
    name = str(row.get('name', '')).strip()
    surname = str(row.get('sername', '')).strip()
    major = str(row.get('Name_major_th', '')).strip()
    plan = str(row.get('Study_plan_th', '')).strip()
    
    s_id, t_id = existing_assignments[sid]
    students_list.append([sid, prefix, name, surname, major, plan, s_id, t_id])

# Sort list by student ID for easier debugging/search inside data.js
students_list.sort(key=lambda x: x[0])

# 5. Write back to data.js preserving STAFF_DATA
with open(data_js_path, 'w', encoding='utf-8') as f:
    f.write("/* AUTO-GENERATED STUDENT DATA WITH RANDOM STABLE ASSIGNMENTS */\n")
    f.write("const STUDENT_DATA = ")
    json.dump(students_list, f, ensure_ascii=False)
    f.write(";\n\n")
    f.write(staff_data_content)
    f.write("\n")

print(f"Successfully generated stable data.js with {len(students_list)} records.")
print(f"Morning session count: {sum(distribution[(0, t)] for t in range(4))}")
print(f"Afternoon session count: {sum(distribution[(1, t)] for t in range(4))}")
print(f"Team distribution: {distribution}")
