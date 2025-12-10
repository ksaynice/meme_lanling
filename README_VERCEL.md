# Vercel Native Deployment Instructions

This project has been rewritten to run entirely on Vercel (Frontend + Backend).

## Prerequisites

1.  **Vercel Account**: You must have a Vercel account.
2.  **GitHub Repository**: Push this code (`frontend-next` directory) to GitHub.

## Deployment Steps

1.  **Import to Vercel**:
    - Go to your Vercel Dashboard.
    - Click **Add New** -> **Project**.
    - Import your Git repository.
    - **Root Directory**: Click Edit and select `frontend-next`.

2.  **Configure Storage (Critical)**:
    - Once the project is created (deployment might fail initially, that's fine), go to the **Storage** tab in your Vercel Project Dashboard.
    - **Create Database**: Select **Vercel Postgres** -> Create New -> Connect to project.
    - **Create Blob**: Select **Vercel Blob** -> Create New -> Connect to project.
    - *These steps automatically add the necessary Environment Variables (`POSTGRES_URL`, `BLOB_READ_WRITE_TOKEN`, etc.) to your project.*

3.  **Redeploy**:
    - Go to the **Deployments** tab.
    - Click **Redeploy** on the failed deployment (or push a new commit).

4.  **Done!**
    - Your app should now be live.
    - Uploads will go to Vercel Blob.
    - Data will go to Vercel Postgres.
    - OCR will run via Tesseract.js Serverless Function.

## Troubleshooting

- **OCR Timeout**: Tesseract.js can be slow on cold starts. If you get timeout errors on upload, consider increasing the max duration of the API route in `app/api/upload/route.ts` (requires Pro plan) or using a smaller image.
