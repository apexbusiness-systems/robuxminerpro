from rembg import remove
import sys

def remove_bg(input_path, output_path):
    with open(input_path, 'rb') as i:
        input_data = i.read()
    
    output_data = remove(input_data)
    
    with open(output_path, 'wb') as o:
        o.write(output_data)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python remove_bg.py <input> <output>")
        sys.exit(1)
    
    remove_bg(sys.argv[1], sys.argv[2])
    print(f"Successfully processed {sys.argv[1]} -> {sys.argv[2]}")
