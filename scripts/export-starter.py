from pathlib import Path
import zipfile,json
root=Path(__file__).resolve().parent.parent
folders=['app','components','hooks','lib','widget','scripts','vendor','build','db','drizzle','public']
files=['README.md','package.json','pnpm-lock.yaml','pnpm-workspace.yaml','tsconfig.json','next.config.ts','vite.config.ts','postcss.config.mjs','components.json','cloudflare-env.d.ts','drizzle.config.ts','eslint.config.mjs','.gitignore','.npmrc']
with zipfile.ZipFile(root/'public/starter.zip','w',zipfile.ZIP_DEFLATED) as z:
 for folder in folders:
  for p in (root/folder).rglob('*'):
   if p.is_file() and p.name!='starter.zip':z.write(p,p.relative_to(root))
 for f in files:z.write(root/f,f)
 z.writestr('.openai/hosting.json',json.dumps({'d1':None,'r2':None},indent=2)+'\n')
print('Sanitized starter:',(root/'public/starter.zip').stat().st_size,'bytes')
