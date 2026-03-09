from simplipfy.Tools.generateSVGFiles import SVGFileGenerator, circuitFiles
from pathlib import Path

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="-path provides the p")
    parser.add_argument(
        '-path',
        type=str,
        required=False,
        help="The path to the circuit files"
    )

    args = parser.parse_args()
    if args.path:
        input_path = args.path
        input_path = Path(input_path).resolve()
    else:
        print("No path provided, using simpliPFy circuits folder")
        input_path = circuitFiles

    print(f"The provided path is: {input_path}")

    generator = SVGFileGenerator(input_path).generateAllFiles()
