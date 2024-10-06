# Typer

Online typing test application that you can use to simply train your keyboard typing or to compete against other users online.
Contains working login system with stats that are saved, online and offline game modes, as well as a global leaderboard.

| Tech stack: HTML, CSS, Javascript, React.JS, Express, mySQL

### Home Page
On the home page you can either register or log in. Once you have logged in within a session your stats will be shown for that account (these are stored in the mySQL database). The stats shown are: best score, best accuracy, number of online wins, number of online losses.
![image](https://github.com/user-attachments/assets/1a5f1cda-ece9-4ead-a48b-6b849e7fb96b)
![image](https://github.com/user-attachments/assets/2203a71e-fe3b-43a2-b264-ef77d2c50421)

### Online Mode
Uses socket.io to allow for multiplayer.
Watch the video below to see the online mode being demonstrated:
[![Video Title](https://img.youtube.com/vi/tSXhjJny60A/0.jpg)](https://www.youtube.com/watch?v=tSXhjJny60A)
![image](https://github.com/user-attachments/assets/23d8fcd9-05fb-4dc0-8536-0a7fbaae7e0b)
![image](https://github.com/user-attachments/assets/1fc49abe-ff8d-481e-bd9c-0c4b1976b18a)

### Offline Practice Mode
Watch the video below to see the offline practice mode being demonstrated:
[![Video Title](https://img.youtube.com/vi/aah2pxRMaoM/0.jpg)](https://www.youtube.com/watch?v=aah2pxRMaoM)
![image](https://github.com/user-attachments/assets/f78ff8d5-a180-44ce-97eb-0fa39fe09033)
![image](https://github.com/user-attachments/assets/efc5cae7-6f8a-4d9d-86bc-f78ccc9c3cf5)

### Leaderboard Page
This page displays the top 100 scores that logged in users have scored whilst playing in a multiplayer game. The leaderboard is stored in the mySQL database.
![image](https://github.com/user-attachments/assets/c4ef4391-4b36-4f98-82d1-59caf782bcc2)
