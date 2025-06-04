# YUM: The UCLA Dining App
YUM was designed with the intent to provide an enhanced browsing experience for users. The app boasts 4 main features: a profile page for users to store their data, a daily menu page for dining halls, a favorites section for meals and food trucks, and a profile page for uses to keep track of their activity. 

# Features
- Profile: All users are prompted to create a profile to store their preferences and activities.
- Menu: The menu page showcases accurate and detailed menus for each dining hall, which helps educate users in their choices and increases satisfaction with their meals.
- Favorites: Users can like meals and check the favorites page to see which of their liked meals are being served on that day. 
- Popular: The trending list is updated daily with the community's favorite meals, acting as inspiration for indecisive users looking for a good meal.

# Built using
- React Native: we made a mobile app for accessibility and ease of use.
- Express: Our backend component which allowed us to build API endpoints
- MongoDB: The database we used to store user information as well as the menu and meal information.
- Cheerio: To dynamically obtain dining hall menus, we used Cheerio to scrape the html and crawl through websites.

# Getting started
## Setting up
1. Install dependencies
   ```bash
   npm install
   ```
2. Set up ngrok
   Follow the instructions in the link below:
   https://ngrok.com/downloads/mac-os?tab=download
   
   ```bash
   ngrok http PORT
   ```
3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

