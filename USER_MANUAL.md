# CodeQuest User Manual

This manual explains how to use CodeQuest as a student or as a professor.

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

## Getting started

### Create an account

1. Open CodeQuest and click **Create an account**.
2. Enter your **name**, **email**, and **password**. Passwords need to be at least 8 characters, with at least one number, one capital letter, and one special character.
3. Choose **Student** or **Professor**.
4. Click **Create account**.

CodeQuest will send you a confirmation email. Follow the link in it to finish setting up your account.

### Sign in

1. Click **Sign in**.
2. Enter your email and password.
3. If you want to stay signed in on this device, check **Remember me**.
4. Click **Sign in** to go to your dashboard.

### Reset your password

1. On the sign-in page, click **Forgot password?**
2. Enter the email tied to your account and click **Send reset link**.
3. Open the email and use the link to set a new password.

### Install CodeQuest on your phone

You can install CodeQuest as an app so it's quicker to open while you walk around campus.

- **iPhone (Safari):** Tap the **Share** button, then **Add to Home Screen**.
- **Android (Chrome):** Tap the **⋮** menu, then **Install app** or **Add to Home screen**.

## For students

### Join a class

To join a class, you need its join code from your professor (for example, `a1b2c3d4e5`).

1. On your dashboard, click **Join a class**.
2. Enter the join code.
3. Click **Join class**. The class will show up on your dashboard.

### Find challenges on the map

Open a class from your dashboard to see the campus map. The map will show pins at locations where challenges are.

1. Allow location access when you're asked. This is needed to figure out which challenges you're near.
2. When you walk toward a pin and get inside its unlock radius, the challenge will unlock and show up in the **Challenges** list.
3. Tap the pin or the challenge in the list to open it.

Some notes on pin behavior:

- You can see locked pins, but you can't open them until you're close enough.
- You can't see pins for hidden challenges until you're within range, so you are encouraged to explore.
- Once you solve a challenge, it stays unlocked no matter where you are.

For each unlocked challenge, the **Challenges** list shows its points and your status: **Not started**, **Attempted**, or solved. The filter lets you show **All**, **Completed**, or **Not completed** challenges.

### Solve a challenge

A challenge page will give an overview of problem, how many points it's worth, and an example test case.

1. Pick **Python**, **Java**, **C++**, or **JavaScript** from the language menu, and the editor will load starter code.
2. Write your solution. It should read from standard input and print to standard output.
3. Click **Run** to test your code on the example input. The output shows up under the editor.
4. Click **Submit** when you're ready. CodeQuest confirms your location and then runs your code against the test cases.

You'll see one of three results:

- **Correct!** Your code passed every test case and you've earned the challenge's points. The button now reads **Solved**.
- **Not quite.** Your output didn't match the expected output. Fix your code and submit again; you can retry as many times as you want.
- **Your program didn't finish cleanly.** Your code crashed or didn't compile. The **Compiler output** panel has the details.

> [!IMPORTANT]
> Submitting only works at the challenge's location. You can still read a challenge after you walk away, but you'll have to go back to submit it.

### Check your feedback

Your professor can leave feedback on your submissions, which will appear at the top of the challenge page. A speech-bubble icon will appear next to the challenge in the Challenges list to indicate if it has received feedback.

### The leaderboard

Each class page has a **Leaderboard** ranking students by total points and updates live.

## For professors

### Create a class

1. On your dashboard, click **Create a class**.
2. Enter a **class name** and a **description**.
3. Click **Create class**.

### Invite students

The class's **join code** is at the top of the class page. Use the copy button next to it and send the code to your students. As students join, they're added to the class **Roster**.

### Create a challenge

1. Open a class and click **Create a challenge** in the **Challenges** section.
2. Fill in **Details**:
    - **Name:** the challenge title, such as "Loops & Arrays".
    - **Points:** a whole number from 1 to 100 (default 10). These are awarded the first time a student solves the challenge.
    - **Problem:** the instructions students read once they reach the location.
3. Set the **Location**:
    - Click the map to drop a pin where students have to go.
    - Pick an **Unlock radius**: **Outdoor spot** (75 ft), **One building** (150 ft), or **Nearby** (300 ft). Near buildings, phone location can be off by 30 to 100 ft, so a bigger radius is recommended.
    - To keep the pin off the map until students are inside the unlock radius, check **Hide pin on the map**.
4. Add **Test cases**, each with an **Input** and an **Expected output**. Students will see the first test case as an example, but all of them have to pass.
    - You can verify your test cases with AI. If something is wrong, the AI will tell you what to fix.
5. Click **Create challenge**, or **Save changes** if you're editing.

### Generate a challenge with AI

The **Generate with AI** panel on a new challenge can write a draft for you.

1. Describe what you want under **What should the challenge be about?** For example: "A warm-up on nested loops that prints a small multiplication table."
2. Clicking **Generate** will fill in the fields for you.
3. Look over the draft. If you don't like it, click **Regenerate**, or **Clear** if you'd rather enter the details yourself.
4. Drop a pin on the map, and click **Create challenge**.

### Edit or delete a challenge

Each row in the **Challenges** list has a **⋯** menu:

- **Edit** opens the challenge form with the current details filled in.
- **Delete** removes the challenge permanently once you confirm.

### Review submissions

Click a challenge in the list to open its **Submissions** table. It lists the language the solution was written in, the status (**Correct** or **Incorrect**), score, and submission time.

In the table you can:

- Search by student name, or filter by language or completion status.
- Expand a row to read the student's code.
- Click a student's score to override it to any value from 0 up to the challenge's points. Press **Enter** to save or **Esc** to cancel.
- Choose **Grade with AI** from the **⋯** menu. You'll get a verdict (**Correct**, **Partially correct**, or **Incorrect**), a suggested score, and notes on issues, suggestions, and strengths.
- Click **Send as feedback** to pass the AI's notes on to the student. You can edit them before sending, and change them later with **Edit feedback**.

### Edit or delete a class

Each class card on your dashboard has a **⋯** menu:

- **Edit** lets you change the class name and description.
- **Delete** permanently removes the class and all of its challenges, student submissions, and enrollments.

## Managing your account

To open the account menu, click your name in the top-right corner.

- **Sign out** signs you out on this device.
- **Delete account** permanently deletes your account and all of your data. You can't undo this.
