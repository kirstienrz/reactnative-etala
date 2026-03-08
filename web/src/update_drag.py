import os
import glob
import re

files = glob.glob('c:/Users/Win10/Desktop/reactnative-etala/web/src/pages/superadmin/*.jsx')

count = 0
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We are looking for something like:
    # <input
    #  type="file"
    #  ...
    #  className="hidden"
    # />
    
    # Regex to find an input tag with className="hidden" and type="file"
    # Since React code varies, we can find className="hidden" inside an input tag.
    
    # Actually, a simpler replace:
    # 1. find `<input...className="hidden"...type="file"`
    # 2. Or just replace `className="hidden"` with `className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"`
    # BUT only for the inputs that are file uploads.
    
    new_content = content
    # Find all <input ... />
    inputs = re.findall(r'<input[^>]+type=["\']file["\'][^>]*className=["\']hidden["\'][^>]*>', content)
    
    modified = False
    for inp in inputs:
        new_inp = inp.replace('className="hidden"', 'className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"')
        new_content = new_content.replace(inp, new_inp)
        modified = True
        
    inputs2 = re.findall(r'<input[^>]*className=["\']hidden["\'][^>]*type=["\']file["\'][^>]*>', content)
    for inp in inputs2:
        new_inp = inp.replace('className="hidden"', 'className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50"')
        new_content = new_content.replace(inp, new_inp)
        modified = True

    # We also need to add 'relative' to the container of this input.
    # The container is usually a <div className="border-2 border-dashed... "> that immediately precedes or wraps this.
    # We can replace `className="border-2 border-dashed` with `className="relative border-2 border-dashed`
    if modified:
        new_content = new_content.replace('className="border-2 border-dashed', 'className="relative border-2 border-dashed')
        
        with open(file, 'w', encoding='utf-8') as f:
             f.write(new_content)
        count += 1
        print("Updated", file)

print(f"Total updated: {count}")
