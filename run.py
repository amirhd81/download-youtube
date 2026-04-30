import yt_dlp
import subprocess
import os
import argparse

# -------- SETTINGS --------
SPLIT_SIZE = "90m"
WORK_DIR = "video_job"
# --------------------------


def run(cmd):
    subprocess.run(cmd, shell=True, check=True)


def download_video(url):
    print("🚀 Downloading video (480p + audio)...")

    if "dropbox.com" in url and "?dl=0" in url:
        url = url.replace("?dl=0", "?dl=1")

    opts = {
        "format": "bestvideo[height=480]+bestaudio/best[height=480]",
        "merge_output_format": "mp4",
        "outtmpl": "video.%(ext)s",

        # SPEED BOOST
        "external_downloader": "aria2c",
        "external_downloader_args": [
            "-x", "16",
            "-k", "1M"
        ],

        "quiet": False
    }

    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)

    print(f"✅ Downloaded: {filename}")
    return filename


def split_rar(file):
    print("📦 Splitting into 90MB parts...")

    base = os.path.basename(file)
    archive_name = "video_archive"

    run(f"rar a -v{SPLIT_SIZE} -m0 {archive_name}.rar '{base}'")

    parts = [f for f in os.listdir() if f.startswith("video_archive")]
    run(f"rm -rf {base}")
    return parts


def git_push(files):
    print("📤 Uploading to GitHub...")

    # Reduce memory usage for VPS
    run("git config pack.windowMemory 10m")
    run("git config pack.packSizeLimit 20m")
    run("git config pack.threads 1")

    for f in files:
        run(f"git add '{f}'")

    run('git commit -m "upload video parts"')


def main(dropbox_url):

    os.makedirs(WORK_DIR, exist_ok=True)
    os.chdir(WORK_DIR)

    video_file = download_video(dropbox_url)

    rar_parts = split_rar(video_file)

    git_push(rar_parts)

    print("✅ Done")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Download video, split into parts, and upload to GitHub")
    parser.add_argument("url", help="The URL of the video to download (e.g., Dropbox or YouTube link)")
    args = parser.parse_args()

    main(args.url)