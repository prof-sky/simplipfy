import os
from dotenv import load_dotenv
import argparse
from simpliPFyBuildTools.getAbsPath import getAbsPath
from typing import Literal
from pathlib import Path

def generate_index_html(sublink: str) -> str:
    """Generate HTML content that redirects to the given commit reference."""
    content=f"""
    <html lang="en">
    <head>
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
        <meta http-equiv="Pragma" content="no-cache"/> <!-- legacy support -->
        <meta http-equiv="Expires" content="0" /> <!-- legacy support -->
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redirecting...</title>
        <script>
          let downloadLink = window.location.hash.substring(1);
          if (downloadLink !== '') {{
            downloadLink = "/#" + downloadLink;
          }}
          let linkToPage = window.location.origin + window.location.pathname + "{sublink}"
          window.location.replace(linkToPage + downloadLink); // Redirects to current version
          
          let link = document.createElement("p")
          link.text = "If you are not redirected "
          let linkElem = document.createElement("a")
          linkElem.text = "click here"
          linkElem.href = linkToPage
          document.body.appendChild(link)
          document.body.appendChild(linkElem)
        </script>
    </head>
    <body>
    </body>
    </html>
    """
    return content

def createRedirectIndex(folderName: str, dest: str = r"..\dist\index.html"):
    content = generate_index_html(folderName)
    with open(dest, "w") as f:
        f.write(content)

def getRedirectIndex(folderName: str) -> str:
    return generate_index_html(folderName)

def getUpdateInProgress() -> str:
    return '''<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="refresh" content="300"> <!-- Optional: Refresh page every 5 minutes -->
                <title>Maintenance</title>
                <style>
                    body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        color: #333;
                        text-align: center;
                    }
                    .message {
                        max-width: 600px;
                        padding: 20px;
                        border: 2px solid #ddd;
                        border-radius: 10px;
                        background: #fff;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    h1 {
                        color: #FFC107;
                    }
                    p {
                        margin: 0;
                    }
                </style>
            </head>
            <body>
                <div class="message">
                    <h1>Update in Progress</h1>
                    <p>SimpliPFy is getting more awesome!</p>
                    <p>We are currently updating the page, please check back in a few minutes.</p>
                    <p>Thank you for your patience!</p>
                </div>
            </body>
            </html>
'''

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--target", choices=["dev", "simplipfy"], default="dev")
    parser.add_argument("--path")

    args = parser.parse_args()

    if args.path:
        dest = getAbsPath(args.path)
    else:
        dest = Path()
        print(f"using current directory: {os.getcwd()}, change with --path")

    createRedirectIndex(str(dest.joinpath("index.html")), args.target)

