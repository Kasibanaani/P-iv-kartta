import re,sys
s=open(sys.argv[1],encoding='utf8').read()
open(sys.argv[2],'w',encoding='utf8').write(re.search(r'<script id="engine">(.*?)</script>',s,re.S).group(1))
