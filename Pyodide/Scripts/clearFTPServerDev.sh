#!/bin/bash
echo "Clearing dev folder on FTP server..."
ncftpls -u "$FTP_USER" -p "$FTP_PASS" -R "ftp://$FTP_SERVER$FTP_FOLDER_DEV" > recursiveListing.txt
# exclude index.html in /dev
sed -i '\|^/dev/index\.html$|d' recursiveListing.txt

# parse file and directory paths from recursiveListing.txt
dirPath=""
declare -a filePaths
while IFS= read -r line; do
    if [[ "${line: -1}" == ":" ]]; then
        dirPath="${line%:}"
        filePaths+=("rmdir $dirPath")
        continue
    fi
    if [[ -z "$line" ]]; then
        continue
    fi
    if [[ "$line" =~ \.$ || "$line" =~ \.\.$ ]]; then
        continue
    fi
    fileName="${line##* }"
    filePath="$dirPath/$fileName"
    filePaths+=("rm $filePath")
    echo "$filePath"
done < recursiveListing.txt
rm recursiveListing.txt

for (( i=${#filePaths[@]}; i>=0; i-- )); do
  echo "${filePaths[$i]}"
done > remCommands.txt

# execute commands to clear ftp server
ncftp -u $FTP_USER -p $FTP_PASS $FTP_SERVER < remCommands.txt