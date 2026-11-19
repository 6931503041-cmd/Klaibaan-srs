  **Project name: Klaibaan**  
  **Team name & members (id, name): homesick**

1. 6931503041 Thanaporn Dandon  
2. 6931503110 Pathanin Tamma   
3. 6931503113 Phonthipha Chomnanon  
4. 6931503115Ranchiya Jiwarangprapawong  
5. 6931503120 Sophitsuda Phonphanbuakhli

  **PROBLEM**  
     **The problem, in 2–3 sentences:**

The problem is that people who have to live far away from home often experience homesickness and lack a safe space where they can seek advice or express their feelings about the experiences they are going through. As a result, they may feel that no one understands them, and in some cases, this can lead to an overwhelming sense of loneliness.

     **Who exactly has it (not “everyone”):** People who study or work far from home.  
   
    **Why it matters / what it costs them today:** They lack the motivation to handle the tasks right in front of them—or fail to perform well—because their minds are preoccupied with thoughts of home. Since this issue directly affects those experiencing it, we launched this project to help alleviate that sense of loneliness, even if only to a small degree.They may lack the motivation to focus on the tasks in front of them or may not perform well because their minds are focused on their family at home

  **GATE 1 — REACHABLE USERS (≥3, interviewed before Week 4\)**

 **Questions** 

**1\. Tell me about your experience living away from home—was it for study or work, and was it in another province or abroad?**

**2\. When did you feel most homesick?**

**3\. Did you confide in anyone when you felt that way? Why did you choose to share it with them?**

**4\. What was your biggest fear about sharing these feelings with others?**

**5\. If someone told you, "I completely understand, I feel the same way," would that help you feel better?**

**6\. If you were looking for posts from people in similar situations, how would you like them categorized? (e.g., missing home-cooked food, difficulty adjusting, missing family, etc.)**

**7\. If you were to post about this, would you want people you know to see that it's you? Why or why not?**

**8\. Have you ever seen hurtful comments on social media? If that happens, how would you like it to be handled?**

**9\. Would having an "I understand" reaction button (like a "Like" button) make you feel better, or would you feel neutral about it?**

**Interviewee 1: Ms. Punyisa Chueakaew *Status:* Student \| *Contact:* 094-819-5779 \| *Date:* September 3, 2026**

1. Living Situation: Attending university far from home.  
2. Most Homesick Moment: At night.  
3. Confiding in Others: Vented to myself.  
4. Biggest Fear: Scared my mother would worry.  
5. Impact of Mutual Feeling: It helps make me feel relieved knowing others feel the same way.  
6. Desired Categories: Methods for adjusting/adapting to new environments.  
7. Identity Visibility: No, I don't want people I know to see it.  
8. Handling Hurtful Comments: Would like them blocked from that page.  
9. "I Understand" Button: Helps me feel better.

**Interviewee 2: Ms. Suchatinee Patpongpichitkul *Status:* Student \| *Contact:* 081-421-6868 \| *Date:* September 3, 2026**

1. Living Situation: Attending university far from home.  
2. Most Homesick Moment: When feeling extremely exhausted.  
3. Confiding in Others: Yes, vented to family and friends. Expressing it helps lessen the burden of those emotions.  
4. Biggest Fear: Scared that others won't understand.  
5. Impact of Mutual Feeling: Helps me feel that there are other people standing where I am.  
6. Desired Categories: Missing family.  
7. Identity Visibility: No, I just want to vent and receive advice from responders without revealing my identity.  
8. Handling Hurtful Comments: Has seen them before; would like a report feature or a ban from the app.  
9. "I Understand" Button: Helps me feel better.

**Interviewee 3: Ms. Patcharaporn Nain *Status:* Student \| *Contact:* 094-689-3721 \| *Date:* September 3, 2026**

1. Living Situation: Studying in a different province from my parents.  
2. Most Homesick Moment: In the evening during sunset; the atmosphere makes me miss home.  
3. Confiding in Others: Didn't vent. Didn't talk to friends out of fear they would get sad too. Didn't call parents because hearing their voices makes me cry instantly, so I text them instead sometimes.  
4. Biggest Fear: Scared my parents would overthink and scared my friends would get sad with me.  
5. Impact of Mutual Feeling: Helps somewhat; makes me feel like I have companions sharing the same fate.  
6. Desired Categories: Would like an additional category for pets.  
7. Identity Visibility: Don't want people to know it's me. Scared acquaintances would tell my parents, making them worried.  
8. Handling Hurtful Comments: If a commenter gets reported more than 3 times, block or ban them from being a user.  
9. "I Understand" Button: Agree; sometimes I don't feel like typing long messages.

  **GATE 2 — MVP SHAPE**  
     **3–5 planned functional requirements:**  
       FR-1 Create/edit a post  
       FR-2 Comment on a post  
       FR-3 Tag/filter posts by category  
       FR-4 Anonymous posting  
       FR-5 Shared-feeling reaction button \+ report inappropriate posts  
   

     **Which FR carries a real rule or decision (not plain CRUD)?**  
     **What data has to persist between sessions?**  
      FR-5 Because it requires a decision-making process by the system administrator.  
     **What data has to persist between sessions?**

1.     User activity \- All user activity  
2. Posts \- What users have posted  
3. Tags/Category \- Archive old data by category  
4. Comments \- Messages users have left on posts   
5. User reactions to posts and comments \- Report

  **GATE 3 — ACCESS**  
     **Any data, licence or system you depend on — and how you know you can get it:**

Database System — For storing Users, Posts, Tags/Categories, Comments, Reactions, and Reports (e.g., Firebase Firestore, MySQL, or PostgreSQL — free for the initial tier).

Hosting/Backend Server — For running the application and API (e.g., Vercel, Render, or Railway — with a free tier available).

Notification/Report Management System — A mechanism for administrators (or an automated system) to review reports and make decisions on banning/blocking users who receive more than a specified number of reports (e.g., more than 3 reports, as suggested by users during interviews).

  **PROCESS & TEAM**  
     **Chosen SDLC (with a 1-line reason):**  
Waterfall, because the team consists solely of first-year students with no prior software development experience.