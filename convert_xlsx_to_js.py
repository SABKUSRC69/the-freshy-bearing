import pandas as pd
import numpy as np
import json
import os
import openpyxl
import re

excel_path = r"มอบตัว69 (1).xlsx"
dest_dir = r"assets/js"
data_js_path = os.path.join(dest_dir, "data.js")
parsed_json_path = os.path.join(dest_dir, "parsed_data_utf8.json")

# 1. Read existing student assignments from data.js
existing_assignments = {}
if os.path.exists(data_js_path):
    try:
        with open(data_js_path, 'r', encoding='utf-8') as f:
            content = f.read()
            start_idx = content.find("STUDENT_DATA = ")
            if start_idx != -1:
                start_idx += len("STUDENT_DATA = ")
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
    except Exception as e:
        print(f"Warning: Could not read existing student data from data.js: {e}")

# 2. Read new Excel sheet (Students - 'มามอบตัว')
if not os.path.exists(excel_path):
    print(f"Excel file not found at: {excel_path}")
    exit(1)

wb = openpyxl.load_workbook(excel_path, data_only=True)
student_sheet_name = wb.worksheets[0].title
staff_sheet_name = wb.worksheets[1].title
print(f"Excel Sheets detected: Student Sheet='{student_sheet_name}', Staff Sheet='{staff_sheet_name}'")

# Load student sheet via pandas
df = pd.read_excel(excel_path, sheet_name=student_sheet_name)
df = df.fillna("")
print("Loaded student excel. Shape:", df.shape)

# Filter and validate student rows
valid_rows = []
for idx, row in df.iterrows():
    sid_val = str(row.get('id_student', '')).strip()
    if not sid_val or sid_val == "":
        continue
    try:
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

# Identify and assign new students
new_students = []
for idx, sid, row in valid_rows:
    if sid not in existing_assignments:
        new_students.append((idx, sid, row))

print(f"Found {len(new_students)} new students to assign groups to.")

# Shuffle new students to randomize their assignment order (stable seed)
np.random.seed(42)
np.random.shuffle(new_students)

# Assign new students to keep sessions and teams balanced
for idx, sid, row in new_students:
    morning_count = sum(distribution[(0, t)] for t in range(4))
    afternoon_count = sum(distribution[(1, t)] for t in range(4))
    
    if morning_count <= afternoon_count:
        target_session = 0
    else:
        target_session = 1
        
    min_team = 0
    min_val = 999999
    for t in range(4):
        val = distribution[(target_session, t)]
        if val < min_val:
            min_val = val
            min_team = t
            
    existing_assignments[sid] = (target_session, min_team)
    distribution[(target_session, min_team)] += 1

# Generate sorted student list
students_list = []
for idx, sid, row in valid_rows:
    prefix = str(row.get('คำนำหน้า', '')).strip()
    name = str(row.get('name', '')).strip()
    surname = str(row.get('sername', '')).strip()
    major = str(row.get('Name_major_th', '')).strip()
    plan = str(row.get('Study_plan_th', '')).strip()
    
    s_id, t_id = existing_assignments[sid]
    students_list.append([sid, prefix, name, surname, major, plan, s_id, t_id])

students_list.sort(key=lambda x: x[0])

# 3. Parse Staff sheet ('สำหรับ Staff')
staff_sheet = wb[staff_sheet_name]
staff_rows = list(staff_sheet.iter_rows(values_only=True))

staff_data = []
subcommittee_data = []

id_pattern = re.compile(r"\b\d{10}\b")

def clean_nickname(nick):
    if not nick:
        return ""
    nick = str(nick).strip()
    nick = re.sub(r"^(ชื่อเล่น|ชื่อ่เล่น|ชื่อเเล่น|ชื่อเ่ล่น|ชื่อ่เเล่น|พี่)\s*", "", nick)
    return nick.strip()

def split_thai_name(fullname):
    fullname = str(fullname).strip()
    fullname = re.sub(r"^\d+\.\s*", "", fullname)
    fullname = fullname.strip()
    
    prefixes = ["นางสาว", "นาง", "นาย", "น.ส.", "ด.ญ.", "ด.ช.", "เด็กหญิง", "เด็กชาย"]
    prefix = ""
    for p in prefixes:
        if fullname.startswith(p):
            prefix = p
            fullname = fullname[len(p):].strip()
            break
            
    parts = fullname.split(None, 1)
    name = parts[0].strip() if len(parts) > 0 else ""
    surname = parts[1].strip() if len(parts) > 1 else ""
    return prefix, name, surname

current_dept = None

for idx, row in enumerate(staff_rows):
    val = row[0]
    if val is None:
        continue
        
    val_str = str(val).strip()
    
    if idx >= 48:
        col6_val = str(row[6]).strip() if row[6] is not None else ""
        
        if col6_val != "" and not col6_val.lower() == "none":
            prefix, name, surname = split_thai_name(val_str)
            
            # Nickname logic
            col4_str = str(row[4]).strip()
            col5_str = str(row[5]).strip()
            
            nickname = ""
            if "ชื่อเล่น" in col4_str and len(col4_str) > 8:
                nickname = clean_nickname(col4_str)
            elif "ชื่อเล่น" in col5_str and len(col5_str) > 8:
                nickname = clean_nickname(col5_str)
            
            if not nickname:
                nickname = clean_nickname(row[5])
                if not nickname or nickname.lower() == "none" or nickname == "รหัสการค้นชื่อ":
                    nickname = clean_nickname(row[4])
            
            position = current_dept or "ที่ปรึกษา องค์การบริหาร องค์การนิสิต"
            role = "subcommittee"
            
            if "ที่ปรึกษา" in position or "SAB68" in position or "SAB69" in position:
                role = "advisor"
            elif "นายก" in position or "Organizer" in position:
                role = "staff"
                
            subcommittee_data.append({
                "id": col6_val,
                "prefix": prefix,
                "name": name,
                "surname": surname,
                "position": position,
                "nickname": nickname,
                "role": role
            })
        else:
            if not val_str.startswith("Row") and not re.match(r"^\d+\.", val_str):
                current_dept = val_str
                if "อนุกรรมการเลขา" in val_str:
                    current_dept = "อนุกรรมการเลขานุการ"
                elif "อนุกรรมการบัญชี" in val_str:
                    current_dept = "อนุกรรมการฝ่ายบัญชี"
                elif "อนุกรรมการเหรัญญิก" in val_str:
                    current_dept = "อนุกรรมการฝ่ายเหรัญญิก"
                elif "แผนงาน" in val_str:
                    current_dept = "อนุกรรมการฝ่ายแผนงานและประกันคุณภาพ"
                elif "พัสดุ" in val_str:
                    current_dept = "อนุกรรมการฝ่ายพัสดุทรัพย์สินและสวัสดิการ"
                elif "จัดหาเงินทุน" in val_str:
                    current_dept = "อนุกรรมการฝ่ายจัดหาเงินทุน"
                elif "ธุรการ" in val_str:
                    current_dept = "อนุกรรมการฝ่ายธุรการและปฏิคม"
                elif "ชั่วโมงกิจกรรม" in val_str:
                    current_dept = "อนุกรรมการฝ่ายชั่วโมงกิจกรรม"
                elif "อาคารสถานที่" in val_str:
                    current_dept = "อนุกรรมการฝ่ายอาคารสถานที่และโสตทัศนูปกรณ์"
                elif "ประชาสัมพันธ์" in val_str:
                    current_dept = "อนุกรรมการฝ่ายประชาสัมพันธ์และทัศนศิลป์"
                
    else:
        if re.match(r"^\d+\.", val_str):
            match = id_pattern.search(val_str)
            if match:
                student_id = match.group(0)
                name_part = val_str.split(".", 1)[1].strip()
                name_part = name_part.replace(student_id, "").strip()
                prefix, name, surname = split_thai_name(name_part)
                
                nickname = clean_nickname(row[4])
                
                position = ""
                if idx + 1 < len(staff_rows) and staff_rows[idx+1][0]:
                    next_val = str(staff_rows[idx+1][0]).strip()
                    if ":" in next_val:
                        position = next_val.split(":", 1)[1].strip()
                
                position = position.replace("  ", " ").strip()
                
                staff_data.append({
                    "id": student_id,
                    "prefix": prefix,
                    "name": name,
                    "surname": surname,
                    "position": position,
                    "nickname": nickname,
                    "role": "staff"
                })

print("Staff parsed:", len(staff_data))
print("Subcommittees / Advisors parsed:", len(subcommittee_data))

combined_staff = staff_data + subcommittee_data

# Save to parsed_data_utf8.json
out_data = {
    "staff": staff_data,
    "subcommittees": subcommittee_data
}
with open(parsed_json_path, "w", encoding="utf-8") as f:
    json.dump(out_data, f, ensure_ascii=False, indent=2)
print(f"Saved parsed staff data to {parsed_json_path}")

# Generate JS representation
staff_js_lines = ["const STAFF_DATA = ["]
for item in combined_staff:
    staff_js_lines.append("    {")
    staff_js_lines.append(f'        "id": "{item["id"]}",')
    staff_js_lines.append(f'        "prefix": "{item["prefix"]}",')
    staff_js_lines.append(f'        "name": "{item["name"]}",')
    staff_js_lines.append(f'        "surname": "{item["surname"]}",')
    staff_js_lines.append(f'        "position": "{item["position"]}",')
    staff_js_lines.append(f'        "nickname": "{item["nickname"]}",')
    staff_js_lines.append(f'        "role": "{item["role"]}"')
    staff_js_lines.append("    },")

if len(combined_staff) > 0:
    staff_js_lines[-1] = "    }"
staff_js_lines.append("];")

staff_js_str = "\n".join(staff_js_lines)

# 4. Write back to data.js
with open(data_js_path, 'w', encoding='utf-8') as f:
    f.write("/* AUTO-GENERATED STUDENT DATA WITH RANDOM STABLE ASSIGNMENTS */\n")
    f.write("const STUDENT_DATA = ")
    json.dump(students_list, f, ensure_ascii=False)
    f.write(";\n\n")
    f.write(staff_js_str)
    f.write("\n")

print(f"Successfully generated stable data.js with {len(students_list)} student records and {len(combined_staff)} staff records.")
print(f"Morning session count: {sum(distribution[(0, t)] for t in range(4))}")
print(f"Afternoon session count: {sum(distribution[(1, t)] for t in range(4))}")
print(f"Team distribution: {distribution}")
