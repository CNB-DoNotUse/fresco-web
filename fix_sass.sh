# For some reason, the gulp sass plugin barfs on these files. Opening them up
# and resaving them somehow corrects this. I don't know why either.
# 
echo "//bs fix" >> ./app/sass/index/pro/pro.scss
echo "//bs fix" >> ./app/sass/index/index.scss
echo "//bs fix" >> ./app/sass/platform/screen.scss
