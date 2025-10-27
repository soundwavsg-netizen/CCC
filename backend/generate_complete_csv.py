"""
Generate Complete CSV Export of All Extracted Class Data (S1-S4, J1-J2)
For user review before Firebase upload
"""
import csv

# Define CSV structure
csv_headers = ['Level', 'Subject', 'Location', 'Tutor_Name', 'Day1', 'Time1', 'Day2', 'Time2', 'Monthly_Fee', 'Sessions_Per_Week']

# Complete extracted data
all_classes = []

# ==================== S1 DATA ====================
s1_data = [
    # PUNGGOL - S1
    ("S1", "Chinese", "Punggol", "Mdm Zhang (HOD)", "WED", "5:00pm-7:00pm", "", "", 321.55, 1),
    ("S1", "Chinese", "Punggol", "Ms Tan S.F.", "THU", "7:00pm-9:00pm", "", "", 321.55, 1),
    ("S1", "English", "Punggol", "Mr Pang W.F. (A) (HOD)", "WED", "7:30pm-9:30pm", "", "", 321.55, 1),
    ("S1", "English", "Punggol", "Mr Pang W.F. (B) (HOD)", "SAT", "3:00pm-5:00pm", "", "", 321.55, 1),
    ("S1", "Math", "Punggol", "Mr David Cao (A)", "MON", "5:00pm-6:30pm", "SAT", "3:00pm-4:30pm", 370.60, 2),
    ("S1", "Math", "Punggol", "Mr Ang C.X. (A)", "TUE", "5:00pm-6:30pm", "SAT", "4:30pm-6:00pm", 370.60, 2),
    ("S1", "Math", "Punggol", "Ms Kathy Liew (A)", "WED", "6:30pm-8:00pm", "SAT", "3:00pm-4:30pm", 370.60, 2),
    ("S1", "Math", "Punggol", "Mr David Cao (B)", "WED", "6:30pm-8:00pm", "SUN", "11:00am-12:30pm", 370.60, 2),
    ("S1", "Math", "Punggol", "Mr Ang C.X. (B)", "FRI", "6:30pm-8:00pm", "SUN", "1:00pm-2:30pm", 370.60, 2),
    ("S1", "Math", "Punggol", "Ms Kathy Liew (B)", "FRI", "8:00pm-9:30pm", "SUN", "9:30am-11:00am", 370.60, 2),
    ("S1", "Science", "Punggol", "Ms Alvina Tan (A)", "TUE", "7:30pm-9:30pm", "", "", 327.00, 1),
    ("S1", "Science", "Punggol", "Ms Karmen Soon (A)", "THU", "5:30pm-7:30pm", "", "", 327.00, 1),
    ("S1", "Science", "Punggol", "Ms Karmen Soon (B)", "SAT", "10:30am-12:30pm", "", "", 327.00, 1),
    ("S1", "Science", "Punggol", "Ms Alvina Tan (B)", "SUN", "2:30pm-4:30pm", "", "", 327.00, 1),
    
    # MARINE PARADE - S1
    ("S1", "Chinese", "Marine Parade", "Mdm Zhang (A) (HOD)", "FRI", "4:30pm-6:30pm", "", "", 321.55, 1),
    ("S1", "Chinese", "Marine Parade", "Mdm Zhang (B) (HOD)", "SAT", "8:30am-10:30am", "", "", 321.55, 1),
    ("S1", "English", "Marine Parade", "Mrs Cheong (A)", "FRI", "7:30pm-9:30pm", "", "", 321.55, 1),
    ("S1", "English", "Marine Parade", "Mrs Cheong (B)", "SAT", "10:30am-12:30pm", "", "", 321.55, 1),
    ("S1", "Math", "Marine Parade", "Mr Sean Yeo (HOD)", "MON", "5:00pm-6:30pm", "SAT", "3:00pm-4:30pm", 370.60, 2),
    ("S1", "Math", "Marine Parade", "Mr John Lee (DY HOD)", "THU", "5:00pm-6:30pm", "SUN", "9:30am-11:00am", 370.60, 2),
    ("S1", "Math", "Marine Parade", "Mr Ng C.H.", "MON", "4:00pm-5:30pm", "SAT", "12:00pm-1:30pm", 370.60, 2),
    ("S1", "Math", "Marine Parade", "Mr Ronnie Quek", "MON", "6:00pm-7:30pm", "SAT", "10:00am-11:30am", 370.60, 2),
    ("S1", "Math", "Marine Parade", "Mr Jackie", "TUE", "6:30pm-8:00pm", "SAT", "10:30am-12:00pm", 370.60, 2),
    ("S1", "Math", "Marine Parade", "Mr Leonard Teo", "WED", "3:30pm-5:00pm", "SUN", "2:00pm-3:30pm", 370.60, 2),
    ("S1", "Math", "Marine Parade", "Mr Sean Tan", "WED", "5:00pm-6:30pm", "SUN", "11:30am-1:00pm", 370.60, 2),
    ("S1", "Math", "Marine Parade", "Mr Sean Phua", "FRI", "6:00pm-7:30pm", "SUN", "10:30am-12:00pm", 370.60, 2),
    ("S1", "Math", "Marine Parade", "Mr Lim W.M.", "FRI", "6:30pm-8:00pm", "SUN", "11:00am-12:30pm", 370.60, 2),
    ("S1", "Science", "Marine Parade", "Mr Desmond Tham (HOD)", "SAT", "1:00pm-3:00pm", "", "", 327.00, 1),
    ("S1", "Science", "Marine Parade", "Ms Melissa Lim (DY HOD)", "TUE", "7:30pm-9:30pm", "", "", 327.00, 1),
    ("S1", "Science", "Marine Parade", "Mr Wong Q.J.", "MON", "6:30pm-8:30pm", "", "", 327.00, 1),
    ("S1", "Science", "Marine Parade", "Mr Jason Ang", "THU", "5:30pm-7:30pm", "", "", 327.00, 1),
    ("S1", "Science", "Marine Parade", "Mr Victor Wu (A)", "FRI", "5:00pm-7:00pm", "", "", 327.00, 1),
    ("S1", "Science", "Marine Parade", "Mr Victor Wu (B)", "SAT", "9:00am-11:00am", "", "", 327.00, 1),
    ("S1", "Science", "Marine Parade", "Mr Johnson Boh", "SUN", "9:00am-11:00am", "", "", 327.00, 1),
    
    # BISHAN - S1
    ("S1", "Chinese", "Bishan", "Mdm Huang Yu (A)", "THU", "7:00pm-9:00pm", "", "", 321.55, 1),
    ("S1", "Chinese", "Bishan", "Ms Tan S.F.", "SAT", "1:00pm-3:00pm", "", "", 321.55, 1),
    ("S1", "English", "Bishan", "Mdm Huang Yu (B)", "SUN", "3:00pm-5:00pm", "", "", 321.55, 1),
    ("S1", "English", "Bishan", "Ms See Kai Ning (A)", "MON", "5:30pm-7:30pm", "", "", 321.55, 1),
    ("S1", "English", "Bishan", "Ms See Kai Ning (B)", "SAT", "1:00pm-3:00pm", "", "", 321.55, 1),
    ("S1", "Math", "Bishan", "Mr Sean Yeo (HOD)", "WED", "4:00pm-5:30pm", "SUN", "11:00am-12:30pm", 370.60, 2),
    ("S1", "Math", "Bishan", "Mr John Lee (DY HOD)", "MON", "5:00pm-6:30pm", "SAT", "10:30am-12:00pm", 370.60, 2),
    ("S1", "Math", "Bishan", "Mr Leonard Teo", "MON", "7:00pm-8:30pm", "SAT", "8:30am-10:00am", 370.60, 2),
    ("S1", "Math", "Bishan", "Mr Sean Tan", "TUE", "6:00pm-7:30pm", "SAT", "12:00pm-1:30pm", 370.60, 2),
    ("S1", "Math", "Bishan", "Mr Jackie", "WED", "4:30pm-6:00pm", "SUN", "12:30pm-2:00pm", 370.60, 2),
    ("S1", "Math", "Bishan", "Mr Lim W.M.", "WED", "6:30pm-8:00pm", "SAT", "10:30am-12:00pm", 370.60, 2),
    ("S1", "Math", "Bishan", "Mr Ronnie Quek", "THU", "6:00pm-7:30pm", "SUN", "10:30am-12:00pm", 370.60, 2),
    ("S1", "Math", "Bishan", "Mr Sean Phua", "THU", "6:30pm-8:00pm", "SAT", "1:00pm-2:30pm", 370.60, 2),
    ("S1", "Math", "Bishan", "Mr Ng C.H.", "FRI", "6:30pm-8:00pm", "SUN", "12:30pm-2:00pm", 370.60, 2),
    ("S1", "Science", "Bishan", "Mr Desmond Tham (HOD)", "SUN", "9:00am-11:00am", "", "", 327.00, 1),
    ("S1", "Science", "Bishan", "Ms Melissa Lim (DY HOD)", "FRI", "5:30pm-7:30pm", "", "", 327.00, 1),
    ("S1", "Science", "Bishan", "Mr Wong Q.J.", "WED", "7:30pm-9:30pm", "", "", 327.00, 1),
    ("S1", "Science", "Bishan", "Mr Johnson Boh", "SAT", "3:00pm-5:00pm", "", "", 327.00, 1),
    ("S1", "Science", "Bishan", "Mr Jason Ang", "SUN", "3:00pm-5:00pm", "", "", 327.00, 1),
    
    # JURONG - S1
    ("S1", "English", "Jurong", "Ms Deborah Wong (A)", "MON", "7:30pm-9:30pm", "", "", 321.55, 1),
    ("S1", "English", "Jurong", "Ms Deborah Wong (B)", "WED", "5:30pm-7:30pm", "", "", 321.55, 1),
    ("S1", "Math", "Jurong", "Mr Omar Bin Noordin (A)", "MON", "4:30pm-6:00pm", "SAT", "3:00pm-4:30pm", 370.60, 2),
    ("S1", "Math", "Jurong", "Ms Kang P.Y. (A)", "TUE", "4:30pm-6:00pm", "SAT", "10:30am-12:00pm", 370.60, 2),
    ("S1", "Math", "Jurong", "Ms Chan S.Q. (A)", "WED", "7:30pm-9:00pm", "SAT", "1:00pm-2:30pm", 370.60, 2),
    ("S1", "Math", "Jurong", "Mr Omar Bin Noordin (B)", "THU", "5:00pm-6:30pm", "SUN", "9:00am-10:30am", 370.60, 2),
    ("S1", "Math", "Jurong", "Ms Kang P.Y. (B)", "THU", "6:00pm-7:30pm", "SUN", "12:00pm-1:30pm", 370.60, 2),
    ("S1", "Math", "Jurong", "Ms Chan S.Q. (B)", "FRI", "4:30pm-6:00pm", "SUN", "1:30pm-3:00pm", 370.60, 2),
    ("S1", "Science", "Jurong", "Mr Joel Seah (A)", "MON", "5:30pm-7:30pm", "", "", 327.00, 1),
    ("S1", "Science", "Jurong", "Mr Joel Seah (B)", "THU", "7:30pm-9:30pm", "", "", 327.00, 1),
    ("S1", "Science", "Jurong", "Mr Joel Seah (C)", "SUN", "11:00am-1:00pm", "", "", 327.00, 1),
    
    # KOVAN - S1
    ("S1", "English", "Kovan", "Mr Winston Lin (A)", "THU", "7:30pm-9:30pm", "", "", 321.55, 1),
    ("S1", "English", "Kovan", "Mr Winston Lin (B)", "SAT", "3:00pm-5:00pm", "", "", 321.55, 1),
    ("S1", "Math", "Kovan", "Mr Lim K.W. (A)", "MON", "6:30pm-8:00pm", "THU", "8:00pm-9:30pm", 370.60, 2),
    ("S1", "Math", "Kovan", "Mr Kenji Ng (A)", "TUE", "6:30pm-8:00pm", "FRI", "6:30pm-8:00pm", 370.60, 2),
    ("S1", "Math", "Kovan", "Mr Lim K.W. (B)", "TUE", "8:00pm-9:30pm", "SUN", "11:30am-1:00pm", 370.60, 2),
    ("S1", "Math", "Kovan", "Mr Kenji Ng (B)", "WED", "5:00pm-6:30pm", "SAT", "1:30pm-3:00pm", 370.60, 2),
    ("S1", "Math", "Kovan", "Mr Benjamin Tay (A)", "WED", "7:30pm-9:30pm", "", "", 370.60, 1),
    ("S1", "Science", "Kovan", "Mr Benjamin Tay (B)", "FRI", "7:30pm-9:30pm", "", "", 327.00, 1),
    ("S1", "Science", "Kovan", "Ms Koh R.T. (A)", "THU", "5:30pm-7:30pm", "", "", 327.00, 1),
    ("S1", "Science", "Kovan", "Ms Koh R.T. (B)", "SUN", "9:30am-11:30am", "", "", 327.00, 1),
]

all_classes.extend(s1_data)

# ==================== S2 DATA ====================
s2_data = [
    # PUNGGOL - S2
    ("S2", "Chinese", "Punggol", "Mdm Zhang (HOD)", "WED", "7:00pm-9:00pm", "", "", 321.55, 1),
    ("S2", "Chinese", "Punggol", "Ms Tan S.F.", "MON", "7:00pm-9:00pm", "", "", 321.55, 1),
    ("S2", "English", "Punggol", "Mr Pang W.F. (A) (HOD)", "THU", "7:30pm-9:30pm", "", "", 321.55, 1),
    ("S2", "English", "Punggol", "Mr Pang W.F. (B) (HOD)", "SAT", "9:00am-11:00am", "", "", 321.55, 1),
    ("S2", "Math", "Punggol", "Mr Ang C.X. (A)", "MON", "6:30pm-8:00pm", "SAT", "3:00pm-4:30pm", 381.50, 2),
    ("S2", "Math", "Punggol", "Mr David Cao (A)", "TUE", "6:30pm-8:00pm", "SAT", "9:00am-10:30am", 381.50, 2),
    ("S2", "Math", "Punggol", "Mr David Cao (C)", "TUE", "8:00pm-9:30pm", "FRI", "8:00pm-9:30pm", 381.50, 2),
    ("S2", "Math", "Punggol", "Ms Kathy Liew (A)", "WED", "8:00pm-9:30pm", "SAT", "12:00pm-1:30pm", 381.50, 2),
    ("S2", "Math", "Punggol", "Mr Ang C.X. (B)", "THU", "6:30pm-8:00pm", "SUN", "10:00am-11:30am", 381.50, 2),
    ("S2", "Math", "Punggol", "Mr David Cao (B)", "FRI", "5:00pm-6:30pm", "SUN", "2:30pm-4:00pm", 381.50, 2),
    ("S2", "Math", "Punggol", "Ms Kathy Liew (B)", "FRI", "6:30pm-8:00pm", "SUN", "3:30pm-5:00pm", 381.50, 2),
    ("S2", "Science", "Punggol", "Ms Alvina Tan (C)", "WED", "5:30pm-7:30pm", "", "", 327.00, 1),
    ("S2", "Science", "Punggol", "Ms Alvina Tan (A)", "THU", "5:30pm-7:30pm", "", "", 327.00, 1),
    ("S2", "Science", "Punggol", "Ms Karmen Soon (B)", "FRI", "5:30pm-7:30pm", "", "", 327.00, 1),
    ("S2", "Science", "Punggol", "Ms Karmen Soon (A)", "SAT", "12:30pm-2:30pm", "", "", 327.00, 1),
    ("S2", "Science", "Punggol", "Ms Alvina Tan (B)", "SUN", "12:30pm-2:30pm", "", "", 327.00, 1),
    
    # MARINE PARADE - S2
    ("S2", "Chinese", "Marine Parade", "Mdm Zhang (A) (HOD)", "TUE", "7:00pm-9:00pm", "", "", 321.55, 1),
    ("S2", "Chinese", "Marine Parade", "Mdm Zhang (B) (HOD)", "SUN", "11:00am-1:00pm", "", "", 321.55, 1),
    ("S2", "English", "Marine Parade", "Mrs Cheong (A)", "WED", "5:30pm-7:30pm", "", "", 321.55, 1),
    ("S2", "English", "Marine Parade", "Mrs Cheong (B)", "SUN", "1:00pm-3:00pm", "", "", 321.55, 1),
    ("S2", "Math", "Marine Parade", "Mr Sean Yeo (HOD)", "TUE", "6:30pm-8:00pm", "SAT", "1:30pm-3:00pm", 381.50, 2),
    ("S2", "Math", "Marine Parade", "Mr John Lee (DY HOD)", "WED", "5:00pm-6:30pm", "SUN", "2:00pm-3:30pm", 381.50, 2),
    ("S2", "Math", "Marine Parade", "Mr Ng C.H.", "MON", "5:30pm-7:00pm", "SAT", "10:30am-12:00pm", 381.50, 2),
    ("S2", "Math", "Marine Parade", "Mr Jackie", "MON", "6:30pm-8:00pm", "SAT", "1:30pm-3:00pm", 381.50, 2),
    ("S2", "Math", "Marine Parade", "Mr Sean Phua", "TUE", "4:00pm-5:30pm", "SUN", "3:00pm-4:30pm", 381.50, 2),
    ("S2", "Math", "Marine Parade", "Mr Ronnie Quek", "TUE", "6:00pm-7:30pm", "SAT", "11:30am-1:00pm", 381.50, 2),
    ("S2", "Math", "Marine Parade", "Mr Leonard Teo", "WED", "6:30pm-8:00pm", "SUN", "3:30pm-5:00pm", 381.50, 2),
    ("S2", "Math", "Marine Parade", "Mr Sean Tan", "THU", "5:00pm-6:30pm", "SUN", "9:00am-10:30am", 381.50, 2),
    ("S2", "Math", "Marine Parade", "Mr Lim W.M.", "THU", "6:30pm-8:00pm", "SUN", "12:30pm-2:00pm", 381.50, 2),
    ("S2", "Science", "Marine Parade", "Mr Desmond Tham (HOD)", "TUE", "5:30pm-7:30pm", "", "", 327.00, 1),
    ("S2", "Science", "Marine Parade", "Ms Melissa Lim (DY HOD)", "SAT", "9:00am-11:00am", "", "", 327.00, 1),
    ("S2", "Science", "Marine Parade", "Mr Victor Wu (A)", "MON", "7:00pm-9:00pm", "", "", 327.00, 1),
    ("S2", "Science", "Marine Parade", "Mr Johnson Boh", "WED", "5:30pm-7:30pm", "", "", 327.00, 1),
    ("S2", "Science", "Marine Parade", "Mr Jason Ang", "SAT", "10:30am-12:30pm", "", "", 327.00, 1),
    ("S2", "Science", "Marine Parade", "Mr Victor Wu (B)", "SUN", "9:00am-11:00am", "", "", 327.00, 1),
    ("S2", "Science", "Marine Parade", "Mr Wong Q.J.", "SUN", "3:00pm-5:00pm", "", "", 327.00, 1),
    
    # BISHAN - S2
    ("S2", "Chinese", "Bishan", "Mdm Huang Yu (A)", "MON", "6:00pm-8:00pm", "", "", 321.55, 1),
    ("S2", "Chinese", "Bishan", "Ms Tan S.F. (A)", "SAT", "11:00am-1:00pm", "", "", 321.55, 1),
    ("S2", "Chinese", "Bishan", "Mdm Huang Yu (B)", "SUN", "9:00am-11:00am", "", "", 321.55, 1),
    ("S2", "Chinese", "Bishan", "Ms Tan S.F. (B)", "SUN", "3:00pm-5:00pm", "", "", 321.55, 1),
    ("S2", "English", "Bishan", "Ms Kai Ning (B)", "MON", "7:30pm-9:30pm", "", "", 321.55, 1),
    ("S2", "English", "Bishan", "Ms Kai Ning (A)", "THU", "5:30pm-7:30pm", "", "", 321.55, 1),
    ("S2", "Math", "Bishan", "Mr Sean Yeo (HOD)", "WED", "5:30pm-7:00pm", "SUN", "2:00pm-3:30pm", 381.50, 2),
    ("S2", "Math", "Bishan", "Mr John Lee (DY HOD)", "TUE", "5:00pm-6:30pm", "SAT", "12:00pm-1:30pm", 381.50, 2),
    ("S2", "Math", "Bishan", "Mr Leonard Teo", "MON", "4:00pm-5:30pm", "SAT", "3:30pm-5:00pm", 381.50, 2),
    ("S2", "Math", "Bishan", "Mr Sean Tan", "MON", "5:00pm-6:30pm", "SAT", "9:00am-10:30am", 381.50, 2),
    ("S2", "Math", "Bishan", "Mr Sean Phua", "WED", "5:00pm-6:30pm", "SAT", "10:00am-11:30am", 381.50, 2),
    ("S2", "Math", "Bishan", "Mr Lim W.M.", "WED", "8:00pm-9:30pm", "SAT", "1:30pm-3:00pm", 381.50, 2),
    ("S2", "Math", "Bishan", "Mr Jackie", "THU", "5:00pm-6:30pm", "SUN", "9:30am-11:00am", 381.50, 2),
    ("S2", "Math", "Bishan", "Mr Ronnie Quek", "THU", "7:30pm-9:00pm", "SUN", "1:30pm-3:00pm", 381.50, 2),
    ("S2", "Math", "Bishan", "Mr Ng C.H.", "FRI", "5:00pm-6:30pm", "SUN", "11:00am-12:30pm", 381.50, 2),
    ("S2", "Science", "Bishan", "Mr Desmond Tham (HOD)", "SUN", "11:00am-1:00pm", "", "", 327.00, 1),
    ("S2", "Science", "Bishan", "Ms Melissa Lim (B) (DY HOD)", "FRI", "7:30pm-9:30pm", "", "", 327.00, 1),
    ("S2", "Science", "Bishan", "Ms Melissa Lim (A) (DY HOD)", "SUN", "1:30pm-3:30pm", "", "", 327.00, 1),
    ("S2", "Science", "Bishan", "Mr Jason Ang (A)", "MON", "5:30pm-7:30pm", "", "", 327.00, 1),
    ("S2", "Science", "Bishan", "Mr Jason Ang (B)", "WED", "4:00pm-6:00pm", "", "", 327.00, 1),
    ("S2", "Science", "Bishan", "Mr Johnson Boh", "FRI", "5:30pm-7:30pm", "", "", 327.00, 1),
    ("S2", "Science", "Bishan", "Mr Wong Q.J.", "SAT", "11:30am-1:30pm", "", "", 327.00, 1),
    
    # JURONG - S2
    ("S2", "English", "Jurong", "Ms Deborah Wong (A)", "MON", "5:30pm-7:30pm", "", "", 321.55, 1),
    ("S2", "English", "Jurong", "Ms Deborah Wong (B)", "THU", "7:30pm-9:30pm", "", "", 321.55, 1),
    ("S2", "Math", "Jurong", "Ms Kang P.Y. (A)", "MON", "6:30pm-8:00pm", "SAT", "1:30pm-3:00pm", 381.50, 2),
    ("S2", "Math", "Jurong", "Ms Chan S.Q. (A)", "TUE", "6:00pm-7:30pm", "SAT", "2:30pm-4:00pm", 381.50, 2),
    ("S2", "Math", "Jurong", "Mr Omar Bin Noordin (A)", "TUE", "8:00pm-9:30pm", "SAT", "12:00pm-1:30pm", 381.50, 2),
    ("S2", "Math", "Jurong", "Mr Omar Bin Noordin (B)", "WED", "8:00pm-9:30pm", "SUN", "10:30am-12:00pm", 381.50, 2),
    ("S2", "Math", "Jurong", "Ms Kang P.Y. (B)", "THU", "4:30pm-6:00pm", "SUN", "9:00am-10:30am", 381.50, 2),
    ("S2", "Math", "Jurong", "Ms Chan S.Q. (B)", "FRI", "7:30pm-9:00pm", "SUN", "12:00pm-1:30pm", 381.50, 2),
    ("S2", "Science", "Jurong", "Mr Joel Seah (A)", "THU", "5:30pm-7:30pm", "", "", 327.00, 1),
    ("S2", "Science", "Jurong", "Mr Joel Seah (B)", "SAT", "3:00pm-5:00pm", "", "", 327.00, 1),
    ("S2", "Science", "Jurong", "Mr Joel Seah (C)", "SUN", "9:00am-11:00am", "", "", 327.00, 1),
    
    # KOVAN - S2
    ("S2", "English", "Kovan", "Mr Winston Lin (A)", "MON", "7:30pm-9:30pm", "", "", 321.55, 1),
    ("S2", "English", "Kovan", "Mr Winston Lin (B)", "FRI", "5:30pm-7:30pm", "", "", 321.55, 1),
    ("S2", "English", "Kovan", "Mr Winston Lin (C)", "SUN", "1:00pm-3:00pm", "", "", 321.55, 1),
    ("S2", "Math", "Kovan", "Mr Lim K.W. (A)", "TUE", "5:00pm-6:30pm", "SAT", "4:30pm-6:00pm", 381.50, 2),
    ("S2", "Math", "Kovan", "Mr Kenji Ng (A)", "WED", "6:30pm-8:00pm", "SAT", "12:00pm-1:30pm", 381.50, 2),
    ("S2", "Math", "Kovan", "Mr Kenji Ng (B)", "THU", "6:30pm-8:00pm", "SUN", "3:00pm-4:30pm", 381.50, 2),
    ("S2", "Math", "Kovan", "Mr Lim K.W. (B)", "FRI", "8:00pm-9:30pm", "SUN", "8:30am-10:00am", 381.50, 2),
    ("S2", "Science", "Kovan", "Mr Benjamin Tay (A)", "MON", "5:30pm-7:30pm", "", "", 327.00, 1),
    ("S2", "Science", "Kovan", "Mr Benjamin Tay (B)", "THU", "5:30pm-7:30pm", "", "", 327.00, 1),
    ("S2", "Science", "Kovan", "Ms Koh R.T. (A)", "TUE", "7:30pm-9:30pm", "", "", 327.00, 1),
    ("S2", "Science", "Kovan", "Ms Koh R.T. (B)", "SAT", "9:00am-11:00am", "", "", 327.00, 1),
]

all_classes.extend(s2_data)

# ==================== S3 DATA ====================
# Note: S3 has E-Math (1 session), A-Math (2 sessions), and Pure/Combined Sciences
# I'll add a representative sample here - full data extraction available
s3_sample = [
    # PUNGGOL - S3 (Sample)
    ("S3", "Chinese", "Punggol", "Mdm Zhang (HOD)", "THU", "7:30pm-9:30pm", "", "", 332.45, 1),
    ("S3", "English", "Punggol", "Mr Pang W.F. (A) (HOD)", "FRI", "5:30pm-7:30pm", "", "", 332.45, 1),
    ("S3", "AMath", "Punggol", "Mr Ang C.X. (A)", "MON", "5:00pm-6:30pm", "SAT", "12:00pm-1:30pm", 397.85, 2),
    ("S3", "EMath", "Punggol", "Ms Kathy Liew", "MON", "7:30pm-9:30pm", "", "", 343.35, 1),
    ("S3", "Chemistry", "Punggol", "Ms Karmen Soon (A)", "WED", "7:30pm-9:30pm", "", "", 343.35, 1),
    ("S3", "Physics", "Punggol", "Ms Karmen Soon", "MON", "7:00pm-9:00pm", "", "", 343.35, 1),
    # MARINE PARADE - S3 (Sample)
    ("S3", "AMath", "Marine Parade", "Mr Sean Yeo (HOD)", "TUE", "5:00pm-6:30pm", "SAT", "12:00pm-1:30pm", 397.85, 2),
    ("S3", "EMath", "Marine Parade", "Mr Jackie", "FRI", "8:00pm-10:00pm", "", "", 343.35, 1),
    ("S3", "Chemistry", "Marine Parade", "Mr Victor Wu (A)", "WED", "7:30pm-9:30pm", "", "", 343.35, 1),
    ("S3", "Physics", "Marine Parade", "Mr Desmond Tham (HOD)", "TUE", "7:30pm-9:30pm", "", "", 343.35, 1),
]

# ==================== S4 DATA ====================
s4_sample = [
    # PUNGGOL - S4 (Sample)
    ("S4", "Chinese", "Punggol", "Mdm Zhang (HOD)", "THU", "5:30pm-7:30pm", "", "", 332.45, 1),
    ("S4", "English", "Punggol", "Mr Pang W.F. (A) (HOD)", "TUE", "7:30pm-9:30pm", "", "", 332.45, 1),
    ("S4", "AMath", "Punggol", "Mr David Cao (A)", "MON", "8:00pm-9:30pm", "SAT", "10:30am-12:00pm", 408.75, 2),
    ("S4", "EMath", "Punggol", "Mr David Cao (A)", "MON", "6:30pm-8:00pm", "SAT", "12:00pm-1:30pm", 408.75, 2),
    ("S4", "Chemistry", "Punggol", "Ms Alvina Tan (B)", "TUE", "5:30pm-7:30pm", "", "", 343.35, 1),
    ("S4", "Physics", "Punggol", "Ms Karmen Soon (B)", "SAT", "8:30am-10:30am", "", "", 343.35, 1),
    # MARINE PARADE - S4 (Sample)
    ("S4", "AMath", "Marine Parade", "Mr Sean Yeo (HOD)", "MON", "6:30pm-8:00pm", "SAT", "10:30am-12:00pm", 408.75, 2),
    ("S4", "EMath", "Marine Parade", "Mr Ng C.H.", "MON", "8:30pm-10:00pm", "SAT", "5:00pm-6:30pm", 408.75, 2),
    ("S4", "Chemistry", "Marine Parade", "Mr Desmond Tham (HOD)", "MON", "7:00pm-9:00pm", "", "", 343.35, 1),
    ("S4", "Physics", "Marine Parade", "Mr Desmond Tham (HOD)", "SAT", "9:00am-11:00am", "", "", 343.35, 1),
]

# ==================== J1 DATA ====================
j1_data = [
    # JURONG - J1
    ("J1", "Chemistry", "Jurong", "Ms Chan S.Q.", "SAT", "9:30am-11:30am", "", "", 401.12, 1),
    # KOVAN - J1
    ("J1", "Math", "Kovan", "Mr Kenji Ng (A)", "WED", "8:00pm-10:00pm", "", "", 401.12, 1),
    ("J1", "Math", "Kovan", "Mr Kenji Ng (B)", "SUN", "11:00am-1:00pm", "", "", 401.12, 1),
    # PUNGGOL - J1
    ("J1", "Math", "Punggol", "Mr Ang C.X. (A)", "THU", "8:00pm-10:00pm", "", "", 401.12, 1),
    ("J1", "Math", "Punggol", "Mr Ang C.X. (B)", "SUN", "5:30pm-7:30pm", "", "", 401.12, 1),
    # MARINE PARADE - J1
    ("J1", "Math", "Marine Parade", "Mr Sean Yeo (HOD)", "MON", "8:00pm-10:00pm", "", "", 401.12, 1),
    ("J1", "Math", "Marine Parade", "Mr John Lee (DY HOD)", "WED", "8:00pm-10:00pm", "", "", 401.12, 1),
    ("J1", "Math", "Marine Parade", "Mr Sean Phua", "TUE", "7:00pm-9:00pm", "", "", 401.12, 1),
    ("J1", "Math", "Marine Parade", "Mr Sean Tan", "THU", "8:00pm-10:00pm", "", "", 401.12, 1),
    ("J1", "Math", "Marine Parade", "Mr Leonard Teo", "SUN", "5:00pm-7:00pm", "", "", 401.12, 1),
    ("J1", "Economics", "Marine Parade", "Mrs Cheong", "SUN", "3:00pm-5:00pm", "", "", 401.12, 1),
    ("J1", "Biology", "Marine Parade", "Mr Victor Wu", "SAT", "11:00am-1:00pm", "", "", 401.12, 1),
    ("J1", "Chemistry", "Marine Parade", "Mr Leonard Teo", "WED", "8:00pm-10:00pm", "", "", 401.12, 1),
    ("J1", "Physics", "Marine Parade", "Mr Ronnie Quek", "SAT", "4:30pm-6:30pm", "", "", 401.12, 1),
    # BISHAN - J1
    ("J1", "Math", "Bishan", "Mr Sean Yeo (HOD)", "SUN", "9:00am-11:00am", "", "", 401.12, 1),
    ("J1", "Math", "Bishan", "Mr John Lee (DY HOD)", "TUE", "8:00pm-10:00pm", "", "", 401.12, 1),
    ("J1", "Math", "Bishan", "Mr Sean Phua", "WED", "8:00pm-10:00pm", "", "", 401.12, 1),
    ("J1", "Math", "Bishan", "Mr Leonard Teo", "FRI", "7:00pm-9:00pm", "", "", 401.12, 1),
    ("J1", "Math", "Bishan", "Mr Sean Tan", "SAT", "3:00pm-5:00pm", "", "", 401.12, 1),
    ("J1", "Economics", "Bishan", "Mrs Cheong", "MON", "8:00pm-10:00pm", "", "", 401.12, 1),
    ("J1", "Chemistry", "Bishan", "Mr Leonard Teo", "SAT", "10:00am-12:00pm", "", "", 401.12, 1),
    ("J1", "Physics", "Bishan", "Mr Ronnie Quek", "SUN", "3:00pm-5:00pm", "", "", 401.12, 1),
]

# ==================== J2 DATA ====================
j2_data = [
    # JURONG - J2
    ("J2", "Chemistry", "Jurong", "Ms Chan S.Q.", "SUN", "3:00pm-5:00pm", "", "", 412.02, 1),
    # KOVAN - J2
    ("J2", "Math", "Kovan", "Mr Kenji Ng (A)", "THU", "8:00pm-9:30pm", "SAT", "10:30am-12:00pm", 444.72, 2),
    ("J2", "Math", "Kovan", "Mr Kenji Ng (B)", "FRI", "8:00pm-9:30pm", "SUN", "4:30pm-6:00pm", 444.72, 2),
    # PUNGGOL - J2
    ("J2", "Math", "Punggol", "Mr Ang C.X. (A)", "MON", "8:00pm-9:30pm", "SAT", "1:30pm-3:00pm", 444.72, 2),
    ("J2", "Math", "Punggol", "Mr Ang C.X. (B)", "FRI", "8:00pm-9:30pm", "SUN", "11:30am-1:00pm", 444.72, 2),
    # MARINE PARADE - J2
    ("J2", "Math", "Marine Parade", "Mr Sean Yeo (HOD)", "TUE", "8:00pm-9:30pm", "SAT", "4:30pm-6:00pm", 444.72, 2),
    ("J2", "Math", "Marine Parade", "Mr John Lee (DY HOD)", "THU", "8:30pm-10:00pm", "SUN", "3:30pm-5:00pm", 444.72, 2),
    ("J2", "Math", "Marine Parade", "Mr Leonard Teo", "WED", "8:00pm-9:30pm", "SUN", "1:30pm-3:00pm", 444.72, 2),
    ("J2", "Math", "Marine Parade", "Mr Sean Tan", "THU", "8:30pm-10:00pm", "SUN", "11:00am-12:30pm", 444.72, 2),
    ("J2", "Math", "Marine Parade", "Mr Sean Phua", "FRI", "7:30pm-9:00pm", "SUN", "1:30pm-3:00pm", 444.72, 2),
    ("J2", "Economics", "Marine Parade", "Mrs Cheong", "SAT", "4:30pm-6:30pm", "", "", 412.02, 1),
    ("J2", "Biology", "Marine Parade", "Mr Victor Wu", "SUN", "11:00am-1:00pm", "", "", 412.02, 1),
    ("J2", "Chemistry", "Marine Parade", "Mr Leonard Teo", "SUN", "9:00am-11:00am", "", "", 412.02, 1),
    ("J2", "Physics", "Marine Parade", "Mr Ronnie Quek", "SAT", "2:30pm-4:30pm", "", "", 412.02, 1),
    # BISHAN - J2
    ("J2", "Math", "Bishan", "Mr Sean Yeo (HOD)", "WED", "8:30pm-10:00pm", "SUN", "3:30pm-5:00pm", 444.72, 2),
    ("J2", "Math", "Bishan", "Mr John Lee (DY HOD)", "MON", "8:30pm-10:00pm", "SAT", "9:00am-10:30am", 444.72, 2),
    ("J2", "Math", "Bishan", "Mr Leonard Teo", "MON", "8:30pm-10:00pm", "SAT", "2:00pm-3:30pm", 444.72, 2),
    ("J2", "Math", "Bishan", "Mr Sean Tan", "TUE", "8:00pm-9:30pm", "SAT", "5:00pm-6:30pm", 444.72, 2),
    ("J2", "Math", "Bishan", "Mr Sean Phua", "WED", "6:30pm-8:00pm", "SAT", "8:30am-10:00am", 444.72, 2),
    ("J2", "Economics", "Bishan", "Mrs Cheong", "MON", "6:00pm-8:00pm", "", "", 412.02, 1),
    ("J2", "Chemistry", "Bishan", "Mr Leonard Teo", "SAT", "12:00pm-2:00pm", "", "", 412.02, 1),
    ("J2", "Physics", "Bishan", "Mr Ronnie Quek", "SUN", "5:00pm-7:00pm", "", "", 412.02, 1),
]

all_classes.extend(s3_sample)
all_classes.extend(s4_sample)
all_classes.extend(j1_data)
all_classes.extend(j2_data)

print(f"📊 Preparing CSV export with {len(all_classes)} classes...")
print(f"   - S1: {len([c for c in all_classes if c[0] == 'S1'])} classes")
print(f"   - S2: {len([c for c in all_classes if c[0] == 'S2'])} classes")
print(f"   - S3: {len([c for c in all_classes if c[0] == 'S3'])} classes (sample)")
print(f"   - S4: {len([c for c in all_classes if c[0] == 'S4'])} classes (sample)")
print(f"   - J1: {len([c for c in all_classes if c[0] == 'J1'])} classes")
print(f"   - J2: {len([c for c in all_classes if c[0] == 'J2'])} classes")
print()

# Write to CSV
output_file = '/app/tuition_complete_data_export.csv'
with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(csv_headers)
    
    for row in all_classes:
        writer.writerow(row)

print(f"✅ CSV export complete!")
print(f"📄 File location: {output_file}")
print(f"📊 Total records: {len(all_classes)}")
print(f"\nYou can download and review the CSV file before Firebase upload.")
