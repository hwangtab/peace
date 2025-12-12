# Project Overview

This is a React-based web application for the "Gangjeong Peace Music Camp", an archive website called "Dear Stranger". The website is available at [https://peaceandmusic.net](https://peaceandmusic.net).

## Technologies Used

*   **Framework**: React (using Create React App)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS with a custom theme defined in `tailwind.config.js`.
*   **Animation**: Framer Motion
*   **Routing**: React Router
*   **Backend**: Express (run with ts-node)

## Project Structure

*   **`src/`**: Contains all the source code for the application.
    *   **`components/`**: Reusable React components.
    *   **`pages/`**: The main pages of the application.
    *   **`data/`**: Static data used throughout the application.
    *   **`api/`**: API-related files, likely for fetching data.
    *   **`assets/`**: Images, fonts, and other static assets.
*   **`public/`**: Publicly accessible files.
*   **`scripts/`**: Node.js scripts for various tasks, such as generating a sitemap.
*   **`server/`**: The source code for the Express backend.

## Building and Running

### Development

To run the app in development mode, use the following command:

```bash
npm start
```

This will start the development server and open the application in your default browser at [http://localhost:3000](http://localhost:3000).

### Production Build

To build the app for production, use the following command:

```bash
npm run build
```

This will create a `build` directory with the optimized and minified production build of the application.

### Backend Server

To start the backend server, use the following command:

```bash
npm run server
```

## Testing

To run the tests, use the following command:

```bash
npm test
```

## Deployment

The application is deployed to GitHub Pages. To deploy the app, use the following command:

```bash
npm run deploy
```
