"""
Add Complete S3 and S4 Data to Dataset
"""
import csv

csv_headers = ['Level', 'Subject', 'Location', 'Tutor_Name', 'Day1', 'Time1', 'Day2', 'Time2', 'Monthly_Fee', 'Sessions_Per_Week']

print("=" * 80)
print("ADDING COMPLETE S3 AND S4 DATA")
print("=" * 80)

# Load existing
all_classes = []
print("\n📥 Loading current dataset...")
base_csv = '/app/tuition_ULTIMATE_COMPLETE_ALL.csv'
with open(base_csv, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        all_classes.append((
            row['Level'], row['Subject'], row['Location'], row['Tutor_Name'],
            row['Day1'], row['Time1'], row['Day2'], row['Time2'],
            float(row['Monthly_Fee']), int(row['Sessions_Per_Week'])
        ))

print(f"   ✅ Loaded: {len(all_classes)} classes")

# ==================== COMPLETE S3 DATA ====================
print("\n📚 Adding complete S3 data...")
s3_complete = [
    # Punggol S3 - Complete
    ('S3', 'Chinese', 'Punggol', 'Ms Tan S.F.', 'SAT', '11:00am-1:00pm', '', '', 332.45, 1),
    ('S3', 'English', 'Punggol', 'Mr Pang W.F. (B) (HOD)', 'SAT', '5:00pm-7:00pm', '', '', 332.45, 1),
    ('S3', 'AMath', 'Punggol', 'Mr David Cao (A)', 'MON', '6:30pm-8:00pm', 'SAT', '1:30pm-3:00pm', 397.85, 2),
    ('S3', 'AMath', 'Punggol', 'Mr Ang C.X. (A)', 'TUE', '8:00pm-9:30pm', 'SUN', '9:30am-11:00am', 397.85, 2),
    ('S3', 'AMath', 'Punggol', 'Mr David Cao (B)', 'WED', '5:00pm-6:30pm', 'SUN', '2:30pm-4:00pm', 397.85, 2),
    ('S3', 'EMath', 'Punggol', 'Ms Kathy Liew (A)', 'MON', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S3', 'EMath', 'Punggol', 'Mr Ang C.X.', 'WED', '8:00pm-10:00pm', '', '', 343.35, 1),
    ('S3', 'EMath', 'Punggol', 'Ms Kathy Liew (B)', 'SAT', '10:30am-12:30pm', '', '', 343.35, 1),
    ('S3', 'Physics (Pure)', 'Punggol', 'Ms Karmen Soon (A)', 'MON', '7:00pm-9:00pm', '', '', 343.35, 1),
    ('S3', 'Physics (Pure)', 'Punggol', 'Ms Karmen Soon (B)', 'SAT', '2:30pm-4:30pm', '', '', 343.35, 1),
    ('S3', 'Chemistry (Pure)', 'Punggol', 'Ms Karmen Soon (C)', 'WED', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S3', 'Chemistry (Pure)', 'Punggol', 'Ms Alvina Tan (A)', 'SUN', '10:30am-12:30pm', '', '', 343.35, 1),
    ('S3', 'Biology (Pure)', 'Punggol', 'Ms Alvina Tan (A)', 'FRI', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S3', 'Combined Science', 'Punggol', 'Ms Alvina Tan (B)', 'SAT', '4:30pm-6:30pm', '', '', 343.35, 1),
    
    # Marine Parade S3 - Complete
    ('S3', 'Chinese', 'Marine Parade', 'Mdm Zhang (HOD)', 'SUN', '3:00pm-5:00pm', '', '', 332.45, 1),
    ('S3', 'English', 'Marine Parade', 'Mrs Cheong', 'SAT', '12:30pm-2:30pm', '', '', 332.45, 1),
    ('S3', 'AMath', 'Marine Parade', 'Mr Sean Yeo (HOD)', 'TUE', '5:00pm-6:30pm', 'SAT', '12:00pm-1:30pm', 397.85, 2),
    ('S3', 'AMath', 'Marine Parade', 'Mr John Lee (DY HOD)', 'WED', '6:30pm-8:00pm', 'SUN', '11:00am-12:30pm', 397.85, 2),
    ('S3', 'AMath', 'Marine Parade', 'Mr Jackie (A)', 'THU', '8:00pm-9:30pm', 'SUN', '2:00pm-3:30pm', 397.85, 2),
    ('S3', 'AMath', 'Marine Parade', 'Mr Sean Tan (A)', 'FRI', '6:30pm-8:00pm', 'SUN', '12:30pm-2:00pm', 397.85, 2),
    ('S3', 'EMath', 'Marine Parade', 'Mr Jackie (B)', 'FRI', '8:00pm-10:00pm', '', '', 343.35, 1),
    ('S3', 'EMath', 'Marine Parade', 'Mr Ronnie Quek', 'SAT', '9:00am-11:00am', '', '', 343.35, 1),
    ('S3', 'EMath', 'Marine Parade', 'Mr Sean Tan (B)', 'SAT', '1:30pm-3:30pm', '', '', 343.35, 1),
    ('S3', 'EMath', 'Marine Parade', 'Mr Leonard Teo', 'SUN', '10:30am-12:30pm', '', '', 343.35, 1),
    ('S3', 'Physics (Pure)', 'Marine Parade', 'Mr Desmond Tham (HOD)', 'TUE', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S3', 'Physics (Pure)', 'Marine Parade', 'Mr Jason Ang', 'SAT', '11:00am-1:00pm', '', '', 343.35, 1),
    ('S3', 'Chemistry (Pure)', 'Marine Parade', 'Mr Victor Wu (A)', 'WED', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S3', 'Chemistry (Pure)', 'Marine Parade', 'Mr Victor Wu (B)', 'SAT', '3:00pm-5:00pm', '', '', 343.35, 1),
    ('S3', 'Biology (Pure)', 'Marine Parade', 'Mr Johnson Boh', 'FRI', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S3', 'Biology (Pure)', 'Marine Parade', 'Ms Melissa Lim (DY HOD)', 'SUN', '9:00am-11:00am', '', '', 343.35, 1),
    ('S3', 'Combined Science', 'Marine Parade', 'Mr Wong Q.J.', 'SAT', '4:30pm-6:30pm', '', '', 343.35, 1),
    
    # Bishan S3 - Complete
    ('S3', 'Chinese', 'Bishan', 'Ms Tan S.F.', 'SAT', '3:00pm-5:00pm', '', '', 332.45, 1),
    ('S3', 'Chinese', 'Bishan', 'Mdm Huang Yu', 'SUN', '11:00am-1:00pm', '', '', 332.45, 1),
    ('S3', 'English', 'Bishan', 'Ms Kai Ning (A)', 'THU', '7:30pm-9:30pm', '', '', 332.45, 1),
    ('S3', 'English', 'Bishan', 'Ms Kai Ning (B)', 'SAT', '11:00am-1:00pm', '', '', 332.45, 1),
    ('S3', 'AMath', 'Bishan', 'Mr Sean Yeo (HOD)', 'THU', '6:30pm-8:00pm', 'SUN', '9:30am-11:00am', 397.85, 2),
    ('S3', 'AMath', 'Bishan', 'Mr John Lee (DY HOD)', 'FRI', '6:30pm-8:00pm', 'SAT', '3:30pm-5:00pm', 397.85, 2),
    ('S3', 'AMath', 'Bishan', 'Mr Sean Tan (A)', 'TUE', '8:00pm-9:30pm', 'SUN', '3:30pm-5:00pm', 397.85, 2),
    ('S3', 'AMath', 'Bishan', 'Mr Sean Phua (A)', 'WED', '8:00pm-9:30pm', 'SAT', '12:00pm-1:30pm', 397.85, 2),
    ('S3', 'EMath', 'Bishan', 'Mr Jackie', 'FRI', '8:00pm-10:00pm', '', '', 343.35, 1),
    ('S3', 'EMath', 'Bishan', 'Mr Ronnie Quek', 'SAT', '9:00am-11:00am', '', '', 343.35, 1),
    ('S3', 'EMath', 'Bishan', 'Mr Lim W.M.', 'SUN', '11:00am-1:00pm', '', '', 343.35, 1),
    ('S3', 'Physics (Pure)', 'Bishan', 'Mr Desmond Tham (HOD)', 'MON', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S3', 'Physics (Pure)', 'Bishan', 'Ms Melissa Lim (DY HOD)', 'SAT', '9:00am-11:00am', '', '', 343.35, 1),
    ('S3', 'Chemistry (Pure)', 'Bishan', 'Ms Melissa Lim (DY HOD)', 'THU', '5:30pm-7:30pm', '', '', 343.35, 1),
    ('S3', 'Chemistry (Pure)', 'Bishan', 'Mr Jason Ang', 'SAT', '1:00pm-3:00pm', '', '', 343.35, 1),
    ('S3', 'Biology (Pure)', 'Bishan', 'Mr Johnson Boh (A)', 'WED', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S3', 'Biology (Pure)', 'Bishan', 'Mr Johnson Boh (B)', 'SUN', '11:00am-1:00pm', '', '', 343.35, 1),
    ('S3', 'Combined Science', 'Bishan', 'Mr Wong Q.J.', 'FRI', '5:30pm-7:30pm', '', '', 343.35, 1),
    
    # Jurong S3 - Complete
    ('S3', 'English', 'Jurong', 'Ms Deborah Wong', 'SAT', '11:00am-1:00pm', '', '', 332.45, 1),
    ('S3', 'AMath', 'Jurong', 'Ms Chan S.Q. (A)', 'TUE', '7:30pm-9:00pm', 'SAT', '9:30am-11:00am', 397.85, 2),
    ('S3', 'AMath', 'Jurong', 'Ms Kang P.Y. (A)', 'WED', '6:30pm-8:00pm', 'SUN', '10:30am-12:00pm', 397.85, 2),
    ('S3', 'AMath', 'Jurong', 'Mr Omar Bin Noordin', 'THU', '8:00pm-9:30pm', 'SUN', '12:00pm-1:30pm', 397.85, 2),
    ('S3', 'EMath', 'Jurong', 'Ms Chan S.Q. (B)', 'MON', '8:00pm-10:00pm', '', '', 343.35, 1),
    ('S3', 'EMath', 'Jurong', 'Ms Kang P.Y. (B)', 'FRI', '6:30pm-8:30pm', '', '', 343.35, 1),
    ('S3', 'Physics (Pure)', 'Jurong', 'Mr Joel Seah (A)', 'WED', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S3', 'Chemistry (Pure)', 'Jurong', 'Mr Joel Seah (B)', 'SAT', '4:30pm-6:30pm', '', '', 343.35, 1),
    ('S3', 'Biology (Pure)', 'Jurong', 'Mr Joel Seah (C)', 'FRI', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S3', 'Combined Science', 'Jurong', 'Mr Joel Seah (D)', 'SUN', '2:00pm-4:00pm', '', '', 343.35, 1),
    
    # Kovan S3 - Complete
    ('S3', 'English', 'Kovan', 'Mr Winston Lin', 'SAT', '11:00am-1:00pm', '', '', 332.45, 1),
    ('S3', 'AMath', 'Kovan', 'Mr Lim K.W. (A)', 'MON', '8:00pm-9:30pm', 'SAT', '3:00pm-4:30pm', 397.85, 2),
    ('S3', 'AMath', 'Kovan', 'Mr Kenji Ng (A)', 'TUE', '8:00pm-9:30pm', 'SUN', '10:00am-11:30am', 397.85, 2),
    ('S3', 'EMath', 'Kovan', 'Mr Lim K.W. (B)', 'THU', '8:00pm-10:00pm', '', '', 343.35, 1),
    ('S3', 'EMath', 'Kovan', 'Mr Kenji Ng (B)', 'SAT', '9:00am-11:00am', '', '', 343.35, 1),
    ('S3', 'Physics (Pure)', 'Kovan', 'Mr Benjamin Tay (A)', 'WED', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S3', 'Chemistry (Pure)', 'Kovan', 'Ms Koh R.T. (A)', 'FRI', '5:30pm-7:30pm', '', '', 343.35, 1),
    ('S3', 'Biology (Pure)', 'Kovan', 'Mr Benjamin Tay (B)', 'SAT', '4:30pm-6:30pm', '', '', 343.35, 1),
    ('S3', 'Combined Science', 'Kovan', 'Ms Koh R.T. (B)', 'SUN', '11:30am-1:30pm', '', '', 343.35, 1),
]
all_classes.extend(s3_complete)
print(f"   ✅ Added {len(s3_complete)} S3 classes (Total S3: {len([c for c in all_classes if c[0] == 'S3'])})")

# ==================== COMPLETE S4 DATA ====================
print("\n📚 Adding complete S4 data...")
s4_complete = [
    # Punggol S4 - Complete
    ('S4', 'English', 'Punggol', 'Mr Pang W.F. (B) (HOD)', 'SAT', '7:00pm-9:00pm', '', '', 332.45, 1),
    ('S4', 'AMath', 'Punggol', 'Mr Ang C.X. (A)', 'MON', '6:30pm-8:00pm', 'SAT', '9:00am-10:30am', 408.75, 2),
    ('S4', 'AMath', 'Punggol', 'Mr David Cao (B)', 'TUE', '6:30pm-8:00pm', 'SAT', '12:00pm-1:30pm', 408.75, 2),
    ('S4', 'AMath', 'Punggol', 'Mr Ang C.X. (B)', 'WED', '8:00pm-9:30pm', 'SUN', '9:30am-11:00am', 408.75, 2),
    ('S4', 'AMath', 'Punggol', 'Ms Kathy Liew', 'THU', '8:00pm-9:30pm', 'SUN', '1:00pm-2:30pm', 408.75, 2),
    ('S4', 'EMath', 'Punggol', 'Mr David Cao (A)', 'MON', '6:30pm-8:00pm', 'SAT', '12:00pm-1:30pm', 408.75, 2),
    ('S4', 'EMath', 'Punggol', 'Mr Ang C.X. (A)', 'TUE', '8:00pm-9:30pm', 'SUN', '2:30pm-4:00pm', 408.75, 2),
    ('S4', 'EMath', 'Punggol', 'Mr David Cao (B)', 'WED', '6:30pm-8:00pm', 'SUN', '11:00am-12:30pm', 408.75, 2),
    ('S4', 'EMath', 'Punggol', 'Ms Kathy Liew', 'FRI', '6:30pm-8:00pm', 'SUN', '4:00pm-5:30pm', 408.75, 2),
    ('S4', 'Physics (Pure)', 'Punggol', 'Ms Karmen Soon (A)', 'MON', '5:00pm-7:00pm', '', '', 343.35, 1),
    ('S4', 'Physics (Pure)', 'Punggol', 'Ms Karmen Soon (B)', 'SAT', '8:30am-10:30am', '', '', 343.35, 1),
    ('S4', 'Chemistry (Pure)', 'Punggol', 'Ms Alvina Tan (A)', 'MON', '7:00pm-9:00pm', '', '', 343.35, 1),
    ('S4', 'Chemistry (Pure)', 'Punggol', 'Ms Alvina Tan (B)', 'TUE', '5:30pm-7:30pm', '', '', 343.35, 1),
    ('S4', 'Biology (Pure)', 'Punggol', 'Ms Alvina Tan (C)', 'THU', '5:30pm-7:30pm', '', '', 343.35, 1),
    ('S4', 'Biology (Pure)', 'Punggol', 'Ms Karmen Soon (C)', 'SAT', '4:30pm-6:30pm', '', '', 343.35, 1),
    ('S4', 'Combined Science', 'Punggol', 'Ms Karmen Soon (D)', 'SUN', '12:30pm-2:30pm', '', '', 343.35, 1),
    
    # Marine Parade S4 - Complete
    ('S4', 'Chinese', 'Marine Parade', 'Mdm Zhang (HOD)', 'SAT', '12:30pm-2:30pm', '', '', 332.45, 1),
    ('S4', 'English', 'Marine Parade', 'Mrs Cheong', 'SUN', '11:00am-1:00pm', '', '', 332.45, 1),
    ('S4', 'AMath', 'Marine Parade', 'Mr Sean Yeo (HOD)', 'MON', '6:30pm-8:00pm', 'SAT', '10:30am-12:00pm', 408.75, 2),
    ('S4', 'AMath', 'Marine Parade', 'Mr John Lee (DY HOD)', 'TUE', '6:30pm-8:00pm', 'SUN', '11:00am-12:30pm', 408.75, 2),
    ('S4', 'AMath', 'Marine Parade', 'Mr Jackie (A)', 'WED', '8:00pm-9:30pm', 'SAT', '3:30pm-5:00pm', 408.75, 2),
    ('S4', 'AMath', 'Marine Parade', 'Mr Sean Tan (A)', 'FRI', '8:00pm-9:30pm', 'SUN', '2:00pm-3:30pm', 408.75, 2),
    ('S4', 'AMath', 'Marine Parade', 'Mr Ronnie Quek', 'THU', '8:00pm-9:30pm', 'SUN', '12:30pm-2:00pm', 408.75, 2),
    ('S4', 'EMath', 'Marine Parade', 'Mr Ng C.H.', 'MON', '8:30pm-10:00pm', 'SAT', '5:00pm-6:30pm', 408.75, 2),
    ('S4', 'EMath', 'Marine Parade', 'Mr Jackie (B)', 'TUE', '8:00pm-9:30pm', 'SAT', '12:00pm-1:30pm', 408.75, 2),
    ('S4', 'EMath', 'Marine Parade', 'Mr Sean Phua', 'WED', '6:30pm-8:00pm', 'SUN', '3:30pm-5:00pm', 408.75, 2),
    ('S4', 'EMath', 'Marine Parade', 'Mr Leonard Teo', 'THU', '6:30pm-8:00pm', 'SUN', '9:30am-11:00am', 408.75, 2),
    ('S4', 'EMath', 'Marine Parade', 'Mr Sean Tan (B)', 'FRI', '6:30pm-8:00pm', 'SUN', '10:30am-12:00pm', 408.75, 2),
    ('S4', 'Physics (Pure)', 'Marine Parade', 'Mr Desmond Tham (HOD)', 'MON', '7:00pm-9:00pm', '', '', 343.35, 1),
    ('S4', 'Physics (Pure)', 'Marine Parade', 'Mr Desmond Tham (HOD)', 'SAT', '9:00am-11:00am', '', '', 343.35, 1),
    ('S4', 'Chemistry (Pure)', 'Marine Parade', 'Mr Victor Wu (A)', 'TUE', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S4', 'Chemistry (Pure)', 'Marine Parade', 'Mr Victor Wu (B)', 'SAT', '11:00am-1:00pm', '', '', 343.35, 1),
    ('S4', 'Biology (Pure)', 'Marine Parade', 'Ms Melissa Lim (DY HOD)', 'WED', '5:30pm-7:30pm', '', '', 343.35, 1),
    ('S4', 'Biology (Pure)', 'Marine Parade', 'Mr Johnson Boh', 'SUN', '11:00am-1:00pm', '', '', 343.35, 1),
    ('S4', 'Combined Science', 'Marine Parade', 'Mr Wong Q.J. (A)', 'THU', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S4', 'Combined Science', 'Marine Parade', 'Mr Jason Ang', 'SUN', '1:00pm-3:00pm', '', '', 343.35, 1),
    
    # Bishan S4 - Complete
    ('S4', 'Chinese', 'Bishan', 'Mdm Huang Yu', 'SAT', '9:00am-11:00am', '', '', 332.45, 1),
    ('S4', 'Chinese', 'Bishan', 'Ms Tan S.F.', 'SUN', '11:00am-1:00pm', '', '', 332.45, 1),
    ('S4', 'English', 'Bishan', 'Ms Kai Ning (A)', 'FRI', '7:30pm-9:30pm', '', '', 332.45, 1),
    ('S4', 'English', 'Bishan', 'Ms Kai Ning (B)', 'SAT', '9:00am-11:00am', '', '', 332.45, 1),
    ('S4', 'AMath', 'Bishan', 'Mr Sean Yeo (HOD)', 'WED', '6:30pm-8:00pm', 'SUN', '11:30am-1:00pm', 408.75, 2),
    ('S4', 'AMath', 'Bishan', 'Mr John Lee (DY HOD)', 'THU', '6:30pm-8:00pm', 'SAT', '1:30pm-3:00pm', 408.75, 2),
    ('S4', 'AMath', 'Bishan', 'Mr Sean Tan (A)', 'FRI', '6:30pm-8:00pm', 'SAT', '3:30pm-5:00pm', 408.75, 2),
    ('S4', 'AMath', 'Bishan', 'Mr Sean Phua (A)', 'THU', '8:00pm-9:30pm', 'SUN', '2:00pm-3:30pm', 408.75, 2),
    ('S4', 'AMath', 'Bishan', 'Mr Leonard Teo', 'TUE', '8:00pm-9:30pm', 'SUN', '9:30am-11:00am', 408.75, 2),
    ('S4', 'EMath', 'Bishan', 'Mr Ng C.H.', 'MON', '6:30pm-8:00pm', 'SAT', '10:30am-12:00pm', 408.75, 2),
    ('S4', 'EMath', 'Bishan', 'Mr Jackie', 'TUE', '6:30pm-8:00pm', 'SAT', '12:00pm-1:30pm', 408.75, 2),
    ('S4', 'EMath', 'Bishan', 'Mr Ronnie Quek', 'WED', '8:00pm-9:30pm', 'SUN', '3:30pm-5:00pm', 408.75, 2),
    ('S4', 'EMath', 'Bishan', 'Mr Sean Phua (B)', 'FRI', '8:00pm-9:30pm', 'SUN', '11:00am-12:30pm', 408.75, 2),
    ('S4', 'EMath', 'Bishan', 'Mr Lim W.M.', 'THU', '6:30pm-8:00pm', 'SUN', '12:30pm-2:00pm', 408.75, 2),
    ('S4', 'Physics (Pure)', 'Bishan', 'Mr Desmond Tham (HOD)', 'WED', '5:30pm-7:30pm', '', '', 343.35, 1),
    ('S4', 'Physics (Pure)', 'Bishan', 'Ms Melissa Lim (DY HOD)', 'SAT', '11:00am-1:00pm', '', '', 343.35, 1),
    ('S4', 'Chemistry (Pure)', 'Bishan', 'Ms Melissa Lim (DY HOD)', 'MON', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S4', 'Chemistry (Pure)', 'Bishan', 'Mr Jason Ang (A)', 'THU', '5:30pm-7:30pm', '', '', 343.35, 1),
    ('S4', 'Biology (Pure)', 'Bishan', 'Mr Johnson Boh (A)', 'TUE', '5:30pm-7:30pm', '', '', 343.35, 1),
    ('S4', 'Biology (Pure)', 'Bishan', 'Mr Johnson Boh (B)', 'SUN', '9:00am-11:00am', '', '', 343.35, 1),
    ('S4', 'Combined Science', 'Bishan', 'Mr Wong Q.J.', 'SAT', '1:00pm-3:00pm', '', '', 343.35, 1),
    ('S4', 'Combined Science', 'Bishan', 'Mr Jason Ang (B)', 'SUN', '1:00pm-3:00pm', '', '', 343.35, 1),
    
    # Jurong S4 - Complete
    ('S4', 'English', 'Jurong', 'Ms Deborah Wong', 'SAT', '1:00pm-3:00pm', '', '', 332.45, 1),
    ('S4', 'AMath', 'Jurong', 'Ms Chan S.Q. (A)', 'MON', '6:30pm-8:00pm', 'SAT', '3:30pm-5:00pm', 408.75, 2),
    ('S4', 'AMath', 'Jurong', 'Ms Kang P.Y. (A)', 'TUE', '8:00pm-9:30pm', 'SAT', '11:00am-12:30pm', 408.75, 2),
    ('S4', 'AMath', 'Jurong', 'Mr Omar Bin Noordin', 'WED', '6:30pm-8:00pm', 'SUN', '3:00pm-4:30pm', 408.75, 2),
    ('S4', 'EMath', 'Jurong', 'Ms Chan S.Q. (B)', 'TUE', '6:30pm-8:00pm', 'SUN', '10:30am-12:00pm', 408.75, 2),
    ('S4', 'EMath', 'Jurong', 'Ms Kang P.Y. (B)', 'FRI', '6:30pm-8:00pm', 'SUN', '9:00am-10:30am', 408.75, 2),
    ('S4', 'Physics (Pure)', 'Jurong', 'Mr Joel Seah (A)', 'MON', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S4', 'Physics (Pure)', 'Jurong', 'Mr Joel Seah (B)', 'SAT', '9:00am-11:00am', '', '', 343.35, 1),
    ('S4', 'Chemistry (Pure)', 'Jurong', 'Mr Joel Seah (C)', 'THU', '5:30pm-7:30pm', '', '', 343.35, 1),
    ('S4', 'Biology (Pure)', 'Jurong', 'Mr Joel Seah (D)', 'FRI', '5:30pm-7:30pm', '', '', 343.35, 1),
    ('S4', 'Combined Science', 'Jurong', 'Mr Joel Seah (E)', 'SUN', '11:00am-1:00pm', '', '', 343.35, 1),
    
    # Kovan S4 - Complete
    ('S4', 'English', 'Kovan', 'Mr Winston Lin', 'SAT', '1:00pm-3:00pm', '', '', 332.45, 1),
    ('S4', 'AMath', 'Kovan', 'Mr Lim K.W. (A)', 'TUE', '6:30pm-8:00pm', 'SAT', '9:30am-11:00am', 408.75, 2),
    ('S4', 'AMath', 'Kovan', 'Mr Kenji Ng (A)', 'WED', '6:30pm-8:00pm', 'SUN', '11:30am-1:00pm', 408.75, 2),
    ('S4', 'AMath', 'Kovan', 'Mr Lim K.W. (B)', 'FRI', '6:30pm-8:00pm', 'SUN', '2:00pm-3:30pm', 408.75, 2),
    ('S4', 'EMath', 'Kovan', 'Mr Kenji Ng (B)', 'MON', '6:30pm-8:00pm', 'SAT', '11:00am-12:30pm', 408.75, 2),
    ('S4', 'EMath', 'Kovan', 'Mr Lim K.W. (C)', 'THU', '6:30pm-8:00pm', 'SUN', '10:00am-11:30am', 408.75, 2),
    ('S4', 'Physics (Pure)', 'Kovan', 'Mr Benjamin Tay (A)', 'MON', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S4', 'Physics (Pure)', 'Kovan', 'Mr Benjamin Tay (B)', 'SAT', '11:00am-1:00pm', '', '', 343.35, 1),
    ('S4', 'Chemistry (Pure)', 'Kovan', 'Ms Koh R.T. (A)', 'TUE', '5:30pm-7:30pm', '', '', 343.35, 1),
    ('S4', 'Biology (Pure)', 'Kovan', 'Ms Koh R.T. (B)', 'THU', '7:30pm-9:30pm', '', '', 343.35, 1),
    ('S4', 'Combined Science', 'Kovan', 'Mr Benjamin Tay (C)', 'SUN', '9:30am-11:30am', '', '', 343.35, 1),
]
all_classes.extend(s4_complete)
print(f"   ✅ Added {len(s4_complete)} S4 classes (Total S4: {len([c for c in all_classes if c[0] == 'S4'])})")

print(f"\n" + "=" * 80)
print(f"🎉 ULTIMATE COMPLETE DATASET GENERATED!")
print("=" * 80)
print(f"\n📊 FINAL SUMMARY BY LEVEL:")
for level in ['P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2', 'S3', 'S4', 'J1', 'J2']:
    count = len([c for c in all_classes if c[0] == level])
    print(f"   {level}: {count} classes")

print(f"\n📈 GRAND TOTAL: {len(all_classes)} classes")

# Write final CSV
output_file = '/app/tuition_COMPLETE_FINAL_ALL_LEVELS.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(csv_headers)
    for row in all_classes:
        writer.writerow(row)

print(f"\n✅ COMPLETE DATASET FILE:")
print(f"📄 Location: {output_file}")
print(f"📊 Total records: {len(all_classes)} classes")
print(f"💾 Estimated size: ~{len(all_classes) * 120 / 1024:.1f} KB")
print("\n🎯 Ready for review before Firebase upload!")
print("=" * 80)
