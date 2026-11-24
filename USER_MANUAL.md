# CodeQuest User Manual

This manual covers everything you need as a **student** or a **professor**.

## Contents

- [Getting started](#getting-started)
  - [Create an account](#create-an-account)
  - [Sign in](#sign-in)
  - [Reset your password](#reset-your-password)
  - [Install CodeQuest on your phone](#install-codequest-on-your-phone)
- [For students](#for-students)
  - [Join a class](#join-a-class)
  - [Find challenges on the map](#find-challenges-on-the-map)
  - [Solve a challenge](#solve-a-challenge)
  - [Check your feedback](#check-your-feedback)
  - [The leaderboard](#the-leaderboard)
- [For professors](#for-professors)
  - [Create a class](#create-a-class)
  - [Invite students](#invite-students)
  - [Create a challenge](#create-a-challenge)
  - [Generate a challenge with AI](#generate-a-challenge-with-ai)
  - [Edit or delete a challenge](#edit-or-delete-a-challenge)
  - [Review submissions](#review-submissions)
  - [Edit or delete a class](#edit-or-delete-a-class)
- [Managing your account](#managing-your-account)

---

## Getting started

### Create an account

1. Open CodeQuest and click **Create an account**.
2. Enter your **name**, **email**, and **password**. Your password must be at least 8 characters and include at least one number, one capital letter, and one special character.
3. Choose **Student** or **Professor**.
4. Click **Create account**.

Check your inbox for a confirmation email, and follow the link to finish setting up your account.

### Sign in

1. Click **Sign in**.
2. Enter your email and password.
3. Check **Remember me** if you want to stay signed in on this device.
4. Click **Sign in**. You'll land on your dashboard.

### Reset your password

1. On the sign-in page, click **Forgot password?**
2. Enter the email on your account and click **Send reset link**.
3. Open the email and follow the link to set a new password.

### Install CodeQuest on your phone

CodeQuest can be installed as an app, which makes it easier to open while you walk around campus.

- **iPhone (Safari):** Tap the **Share** button, then **Add to Home Screen**.
- **Android (Chrome):** Tap the **⋮** menu, then **Install app** or **Add to Home screen**.

---

## For students

### Join a class

Your professor will give you a **join code** (for example, `a1b2c3d4e5`).

1. On your dashboard, click **Join a class**.
2. Enter the join code.
3. Click **Join class**. The class now appears on your dashboard.

### Find challenges on the map

Open a class from your dashboard to see the campus map. Each pin is a challenge.

1. When prompted, **allow location access**. CodeQuest needs your location to know which challenges you're close to.
2. Walk toward a pin. Once you're inside its unlock radius, the challenge unlocks and appears in the **Challenges** list.
3. Tap the pin or the challenge in the list to open it.

Keep in mind:

- Locked pins are visible but can't be opened until you're close enough.
- Some challenges are **hidden**. Their pins don't appear on the map until you're within range, so explore.
- Challenges you've already solved stay unlocked wherever you are.
- If no challenges are nearby, the list says **No challenges nearby**. Keep walking.

The **Challenges** list shows each unlocked challenge's points and your status: **Not started**, **Attempted**, or solved. Use the filter to show **All**, **Completed**, or **Not completed** challenges.

### Solve a challenge

Each challenge page shows the problem, its point value, and example inputs with their expected outputs.

1. Choose your language from the menu: **Python**, **Java**, **C++**, or **JavaScript**. The editor fills in starter code.
2. Write your solution. Your program should read from standard input and print to standard output.
3. Click **Run** to try your code against the example input. The output appears below the editor.
4. When you're ready, click **Submit**. CodeQuest checks your location, then tests your code against every test case.

After you submit:

- **Correct!** All test cases passed, and you've earned the challenge's points. The button changes to **Solved**.
- **Not quite.** Your output didn't match what the challenge expects. Fix your code and submit again. There's no penalty for retrying.
- **Your program didn't finish cleanly.** Your code crashed or failed to compile. Check the **Compiler output** panel for details.

> [!IMPORTANT]
> You must be at the challenge's location to **submit**. If you walk away, you can still read the challenge, but you'll need to return to submit.

### Check your feedback

Your professor may leave feedback on your submissions. Challenges with feedback show a speech-bubble icon in the Challenges list. Open the challenge and **Instructor feedback** will be at the top.

### The leaderboard

Every class page has a **Leaderboard** that ranks students by total points. It updates live as classmates solve challenges.

---

## For professors

### Create a class

1. On your dashboard, click **Create a class**.
2. Enter a **class name** and a **description**.
3. Click **Create class**.

### Invite students

Every class has a **join code**, shown at the top of the class page. Click the copy button next to it and share the code with your students. They'll enter it under **Join a class** on their dashboard.

Students appear in the class **Roster** once they join. As the professor, you can also see each student's email.

### Create a challenge

1. Open a class and click **Create a challenge** in the **Challenges** section.
2. Fill in **Details**:
    - **Name:** the challenge title, such as "Loops & Arrays".
    - **Points:** a whole number from 1 to 100 (default 10). Each student earns these points once, when they solve it.
    - **Problem:** the instructions students see after they reach the location.
3. Set the **Location**:
    - Click the map to drop a pin where students need to go.
    - Choose an **Unlock radius**: **Outdoor spot** (75 ft), **One building** (150 ft), or **Nearby** (300 ft). Phone location can drift 30–100 ft near buildings, so a larger radius is more forgiving.
    - Check **Hide pin on the map** if students shouldn't see the pin until they're within the unlock radius.
4. Add **Test cases**. Each test case has an **Input** and an **Expected output**. A submission is correct only if it passes every test case. The first test case is shown to students as an example.
5. Click **Create challenge** (or **Save changes** when editing).

### Generate a challenge with AI

When you create a new challenge, the **Generate with AI** panel can draft one for you.

1. Under **What should the challenge be about?**, describe the challenge. For example: "A warm-up on nested loops that prints a small multiplication table."
2. Click **Generate**.
3. Review the draft. It includes a title, points, a problem description, test cases, and a reference solution.
4. Click **Use this challenge** to fill in the form, or click **Regenerate** to try again.
5. Review and adjust everything, drop a pin on the map, and click **Create challenge**.

> [!TIP]
> Always check AI-generated test cases before saving. Students' submissions are graded against them exactly.

### Edit or delete a challenge

In the **Challenges** list, open the **⋯** menu on a challenge row:

- **Edit** opens the challenge form with its current details.
- **Delete** permanently removes the challenge after you confirm.

### Review submissions

Select a challenge in the list to see its **Submissions** table, which shows each student's language, status (**Correct** or **Incorrect**), score, and submission time.

From here you can:

- **Search** by student name, or **filter** by language or completion status.
- **View code** by expanding a row.
- **Change points** by clicking a student's score and typing a new value from 0 up to the challenge's points. Press **Enter** to save or **Esc** to cancel.
- **Grade with AI** from the row's **⋯** menu. The AI recommendation shows a verdict (**Correct**, **Partially correct**, or **Incorrect**), a suggested score, and notes on issues, suggestions, and strengths. AI suggestions are recommendations only and don't change a score until you do.
- **Send as feedback** to share the AI's notes with the student, editing them first if you like. You can update it later with **Edit feedback**.

### Edit or delete a class

On your dashboard, open the **⋯** menu on a class card:

- **Edit** changes the class name and description.
- **Delete** permanently removes the class, along with its challenges, student submissions, and enrollments.

---

## Managing your account

Click your name in the top-right corner to open the account menu.

- **Sign out** signs you out of this device.
- **Delete account** permanently deletes your account and all of your data. This can't be undone.
