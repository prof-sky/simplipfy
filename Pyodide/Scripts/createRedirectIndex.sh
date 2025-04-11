content=$(cat <<EOF
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache"/> <!-- legacy support -->
    <meta http-equiv="Expires" content="0" /> <!-- legacy support -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Redirecting...</title>
    <script>
      window.location.replace("/$CI_COMMIT_TAG"); // Redirects to current version
    </script>
  </head>
  <body>
    <p>If you are not redirected, <a href="/$CI_COMMIT_TAG">click here</a>.</p>
  </body>
</html>
EOF
)
echo "$content" > index.html