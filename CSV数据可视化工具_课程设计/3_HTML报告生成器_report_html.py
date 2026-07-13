# -*- coding: utf-8 -*-
"""CSV -> HTML 报告生成器 v3 (高级版)"""
import csv, math, sys, os
from datetime import datetime

CSS = '''
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
html,body{min-height:100vh}
body{font-family:"Microsoft YaHei","PingFang SC",sans-serif;max-width:1000px;margin:0 auto;padding:0;color:#2d3436;position:relative;background:transparent}
/* 全屏背景 */
.page-bg{position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:-1;pointer-events:none;overflow:hidden;background:linear-gradient(180deg,#f5f6fa 0%,#f8f9fa 30%,#eef1f5 70%,#e8ecf1 100%)}
.page-bg .grid{position:absolute;left:0;top:0;width:100%;height:100%;background-image:linear-gradient(rgba(57,73,171,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(57,73,171,.03) 1px,transparent 1px);background-size:60px 60px}
.page-bg .circle1{position:absolute;left:-80px;top:15%;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,rgba(57,73,171,.06),transparent 70%)}
.page-bg .circle2{position:absolute;right:-100px;bottom:20%;width:250px;height:250px;border-radius:50%;background:radial-gradient(circle,rgba(33,150,243,.05),transparent 70%)}
.page-bg .circle3{position:absolute;left:40%;top:60%;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(0,206,201,.04),transparent 70%)}
.page-bg .line-v{position:absolute;left:15%;top:0;bottom:0;width:1px;background:linear-gradient(180deg,transparent,rgba(57,73,171,.05) 20%,rgba(57,73,171,.05) 80%,transparent)}
.page-bg .line-v2{position:absolute;right:20%;top:0;bottom:0;width:1px;background:linear-gradient(180deg,transparent,rgba(57,73,171,.04) 30%,rgba(57,73,171,.04) 70%,transparent)}
.bg-dot-l{position:fixed;left:20px;top:20%;z-index:1;pointer-events:none;opacity:.08;font-size:10px;line-height:2.5;color:#1a237e;font-family:monospace;white-space:pre}
.bg-dot-r{position:fixed;right:20px;top:30%;z-index:1;pointer-events:none;opacity:.08;font-size:10px;line-height:2.5;color:#1a237e;font-family:monospace;white-space:pre;text-align:right}
.cover{background:linear-gradient(135deg,#1a237e,#283593,#3949ab);color:white;padding:100px 60px;text-align:center;border-radius:0 0 40px 40px;margin-bottom:50px;position:relative;overflow:hidden}
.cover::before{content:'◆ ◇ ◇ ◆';position:absolute;top:20px;right:30px;font-size:16px;opacity:.12;letter-spacing:10px;transform:rotate(90deg);white-space:nowrap}
.cover .corner-tl{position:absolute;top:20px;left:30px;font-size:10px;color:rgba(255,255,255,.08);letter-spacing:4px;line-height:1.8}
.cover .corner-br{position:absolute;bottom:20px;right:30px;font-size:10px;color:rgba(255,255,255,.08);letter-spacing:4px;line-height:1.8;text-align:right}
.cover::after{content:'';position:absolute;bottom:0;left:0;right:0;height:6px;background:linear-gradient(90deg,#00b894,#00cec9,#0984e3,#6c5ce7)}
.cover .deco-line{position:absolute;left:50%;transform:translateX(-50%);bottom:40px;width:60%;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent)}
.cover::after{content:'';position:absolute;bottom:0;left:0;right:0;height:6px;background:linear-gradient(90deg,#00b894,#00cec9,#0984e3,#6c5ce7)}
.cover h1{font-size:38px;font-weight:700;margin-bottom:15px;letter-spacing:2px;transition:transform .1s;will-change:transform}
.cover .sub{font-size:18px;opacity:.9;margin-bottom:10px}
.cover .date{font-size:14px;opacity:.6;margin-top:20px}
.cover .line{width:80px;height:3px;background:linear-gradient(90deg,#00b894,#00cec9,#0984e3);margin:20px auto;transition:transform .1s;will-change:transform}
.section{background:white;border-radius:16px;padding:40px;margin:0 30px 40px;box-shadow:0 2px 20px rgba(0,0,0,.06);transition:transform .4s cubic-bezier(.34,1.56,.64,1),box-shadow .3s ease,opacity .4s ease!important;position:relative}
.section::before{content:'◆';position:absolute;top:-8px;left:-8px;font-size:16px;color:#3949ab;opacity:.2}
.section::after{content:'◆';position:absolute;bottom:-8px;right:-8px;font-size:16px;color:#3949ab;opacity:.2}
.section:hover{box-shadow:0 8px 40px rgba(26,35,126,.15)}
.section h2{font-size:24px;color:#1a237e;margin-bottom:25px;padding-bottom:12px;border-bottom:3px solid #e8eaf6;display:flex;align-items:center;gap:10px}
.section h2 .num{background:#1a237e;color:white;width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700}
.section h2 .bar{flex:1;height:2px;background:linear-gradient(90deg,#e8eaf6,transparent);margin-left:10px}
.info-box{display:flex;gap:20px;margin-bottom:20px;flex-wrap:wrap}
.info-item{background:#f0f4ff;padding:15px 25px;border-radius:10px;text-align:center;flex:1;min-width:120px}
.info-item .val{font-size:28px;font-weight:700;color:#1a237e}
.info-item .lab{font-size:13px;color:#666;margin-top:4px}
table{width:100%;border-collapse:collapse;margin-top:10px;border-radius:10px;overflow:hidden}
th{background:#1a237e;color:white;padding:12px 16px;text-align:left;font-weight:500}
td{padding:10px 16px;border-bottom:1px solid #eee}
tr:hover{background:#f5f7ff}
.badge-num{display:inline-block;background:#e3f2fd;color:#1565c0;padding:3px 12px;border-radius:12px;font-size:12px;font-weight:600}
.badge-txt{display:inline-block;background:#f3e5f5;color:#7b1fa2;padding:3px 12px;border-radius:12px;font-size:12px;font-weight:600}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-top:10px}
.stat-card{background:linear-gradient(135deg,#f8f9ff,#eef1ff);padding:20px;border-radius:12px;border:1px solid #e8eaf6;transition:all .3s ease;cursor:default;position:relative;overflow:hidden}
.stat-card::after{content:'';position:absolute;top:-50%;left:-50%;width:200%;height:200%;background:linear-gradient(45deg,transparent 30%,rgba(57,73,171,.03) 50%,transparent 70%);transition:all .6s ease;opacity:0}
.stat-card:hover{box-shadow:0 6px 24px rgba(26,35,126,.15);border-color:#3949ab;transform:translateY(-2px)}
.stat-card:hover::after{opacity:1;transform:translate(30%,10%)}
.stat-card h3{font-size:15px;color:#1a237e;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #e8eaf6}
.stat-card p{margin:4px 0;font-size:13px;color:#555;display:flex;justify-content:space-between}
.stat-card p .sv{font-weight:600;color:#1a237e;transition:color .3s}
.stat-card:hover p .sv{color:#3949ab}
.chart-box{background:#fafbff;border:1px solid #eef1ff;border-radius:12px;padding:20px;margin:16px 0;transition:all .3s ease;position:relative;overflow:hidden}
.chart-box::before{content:'';position:absolute;top:0;right:0;width:120px;height:120px;background:radial-gradient(circle,rgba(57,73,171,.04),transparent 70%);pointer-events:none}
.chart-box::after{content:'';position:absolute;bottom:0;left:0;width:80px;height:80px;background:radial-gradient(circle,rgba(100,181,246,.04),transparent 70%);pointer-events:none}
.chart-box:hover{border-color:#3949ab;background:#f0f3ff;box-shadow:0 4px 20px rgba(26,35,126,.08)}
.chart-box:hover::before{width:160px;height:160px;transition:all .6s ease}
.chart{position:relative;z-index:1}
.bar-0,.bar-1,.bar-2,.bar-3,.bar-4,.bar-5,.bar-6,.bar-7,.bar-8,.bar-9{display:inline-block;position:relative;transition:all .3s}
.bar-0{color:#e3f2fd;text-shadow:0 0 2px rgba(227,242,253,.3)}.bar-1{color:#bbdefb;text-shadow:0 0 2px rgba(187,222,251,.3)}
.bar-2{color:#90caf9;text-shadow:0 0 3px rgba(144,202,249,.3)}.bar-3{color:#64b5f6;text-shadow:0 0 3px rgba(100,181,246,.3)}
.bar-4{color:#42a5f5;text-shadow:0 0 4px rgba(66,165,245,.3)}.bar-5{color:#2196f3;text-shadow:0 0 4px rgba(33,150,243,.3)}
.bar-6{color:#1e88e5;text-shadow:0 0 5px rgba(30,136,229,.3)}.bar-7{color:#1565c0;text-shadow:0 0 5px rgba(21,101,192,.3)}
.bar-8{color:#0d47a1;text-shadow:0 0 6px rgba(13,71,161,.3)}.bar-9{color:#002171;text-shadow:0 0 6px rgba(0,33,113,.3)}
.chart-box:hover .bar-0{color:#e3f2fd;text-shadow:0 0 8px rgba(227,242,253,.5)}
.chart-box:hover .bar-1{color:#bbdefb;text-shadow:0 0 8px rgba(187,222,251,.5)}
.chart-box:hover .bar-2{color:#90caf9;text-shadow:0 0 8px rgba(144,202,249,.5)}
.chart-box:hover .bar-3{color:#64b5f6;text-shadow:0 0 8px rgba(100,181,246,.5)}
.chart-box:hover .bar-4{color:#42a5f5;text-shadow:0 0 8px rgba(66,165,245,.5)}
.chart-box:hover .bar-5{color:#2196f3;text-shadow:0 0 8px rgba(33,150,243,.5)}
.chart-box:hover .bar-6{color:#1e88e5;text-shadow:0 0 8px rgba(30,136,229,.5)}
.chart-box:hover .bar-7{color:#1565c0;text-shadow:0 0 8px rgba(21,101,192,.5)}
.chart-box:hover .bar-8{color:#0d47a1;text-shadow:0 0 8px rgba(13,71,161,.5)}
.chart-box:hover .bar-9{color:#002171;text-shadow:0 0 8px rgba(0,33,113,.5)}
.chart-box h3{font-size:16px;color:#1a237e;margin-bottom:15px;display:flex;align-items:center;gap:8px}
.chart-box .chart{font-family:"Courier New","Consolas",monospace;font-size:15px;font-weight:600;line-height:2;white-space:pre-wrap;word-break:break-all;background:#fff;padding:15px;border-radius:8px;overflow-x:auto;letter-spacing:1px}
.bar-0,.bar-1,.bar-2,.bar-3,.bar-4,.bar-5,.bar-6,.bar-7,.bar-8,.bar-9{font-weight:700;font-size:16px}
.bar-0{color:#bbdefb}.bar-1{color:#90caf9}.bar-2{color:#64b5f6}.bar-3{color:#42a5f5}.bar-4{color:#2196f3}.bar-5{color:#1e88e5}.bar-6{color:#1976d2}.bar-7{color:#1565c0}.bar-8{color:#0d47a1}.bar-9{color:#002171}
.footer{text-align:center;padding:30px;color:#999;font-size:13px;border-top:1px solid #eee;margin-top:40px}
.tr-hover tr{cursor:default;transition:background .2s}
@keyframes fadeInUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
.section{animation:fadeInUp .6s ease forwards}
.section:nth-child(2){animation-delay:.1s}
.section:nth-child(3){animation-delay:.2s}
.section:nth-child(4){animation-delay:.3s}
@media print{body{background:white}.section{box-shadow:none;border:1px solid #eee;page-break-inside:avoid;animation:none}.cover{border-radius:0}}
'''

JS = '''
document.querySelectorAll('.stat-card').forEach(c=>{c.addEventListener('mousemove',function(e){
let r=this.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
this.style.background=`radial-gradient(circle at ${x}px ${y}px,#eef1ff,#f8f9ff)`});
c.addEventListener('mouseleave',function(){this.style.background='linear-gradient(135deg,#f8f9ff,#eef1ff)'})})
document.querySelectorAll('.info-item').forEach(c=>{c.addEventListener('mousemove',function(e){
let r=this.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
this.style.background=`radial-gradient(circle at ${x}px ${y}px,#e3e8ff,#f0f4ff)`});
c.addEventListener('mouseleave',function(){this.style.background='#f0f4ff'})})

/* 封面鼠标跟随视差 */
let cv=document.querySelector('.cover');
if(cv){cv.addEventListener('mousemove',function(e){
let r=this.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
let h1=this.querySelector('h1'),ln=this.querySelector('.line');
if(h1)h1.style.transform=`translate(${x*20}px,${y*10}px)`;if(ln)ln.style.transform=`translate(${x*15}px,${y*8}px) scaleX(${1+Math.abs(x)*.3})`;
});cv.addEventListener('mouseleave',function(){
let h1=this.querySelector('h1'),ln=this.querySelector('.line');
if(h1)h1.style.transition='all .6s cubic-bezier(.34,1.56,.64,1)';if(ln)ln.style.transition='all .6s cubic-bezier(.34,1.56,.64,1)';
if(h1)h1.style.transform='';if(ln)ln.style.transform='';
setTimeout(function(){if(h1)h1.style.transition='';if(ln)ln.style.transition=''},700)})}
/* 居中放大 + 视差 */
cards=document.querySelectorAll('.section, .stat-card');
function updateScale(){let wh=window.innerHeight/2,st=window.scrollY;
cards.forEach(c=>{let r=c.getBoundingClientRect(),center=r.top+r.height/2;
let dist=Math.abs(center-wh)/wh;dist=Math.min(dist,1);
let s=1+Math.max(0,1-dist*2)*.06;c.style.transform=`scale(${s})`;
c.style.opacity=.65+.35*Math.max(0,1-dist*1.5)})}
window.addEventListener('scroll',updateScale);window.addEventListener('resize',updateScale);updateScale();

/* 滚动进度条 */
let pb=document.createElement('div');pb.style.cssText='position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#3949ab,#00cec9);z-index:9999;transition:width .1s';
document.body.appendChild(pb);
window.addEventListener('scroll',function(){let h=document.documentElement.scrollHeight-window.innerHeight;pb.style.width=(h>0?window.scrollY/h*100:0)+'%'});

/* 视差背景 */
let bg=document.querySelector('.page-bg');
window.addEventListener('scroll',function(){let st=window.scrollY;if(bg){let c1=bg.children[2],c2=bg.children[3],c3=bg.children[4];if(c1)c1.style.transform=`translateY(${st*.08}px)`;if(c2)c2.style.transform=`translateY(${-st*.05}px)`;if(c3)c3.style.transform=`translateY(${st*.04}px)`}});

/* 回到顶部 */
let bt=document.createElement('div');bt.innerHTML='↑';bt.style.cssText='position:fixed;bottom:30px;right:30px;width:44px;height:44px;background:#1a237e;color:white;border:none;border-radius:50%;cursor:pointer;font-size:22px;display:flex;align-items:center;justify-content:center;opacity:0;transition:all .4s;z-index:9998;box-shadow:0 4px 15px rgba(26,35,126,.3)';
bt.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});
document.body.appendChild(bt);
window.addEventListener('scroll',function(){bt.style.opacity=window.scrollY>300?'1':'0';bt.style.transform=window.scrollY>300?'scale(1)':'scale(.5)'});
'''

def build_html(title, subtitle, date_str, overview_html, summary_html, chart_html):
    return f'''<!DOCTYPE html><html lang="zh-CN"><head>
<meta charset="UTF-8"><title>{title}</title><style>{CSS}</style></head><body>

<div class="page-bg"><div class="grid"></div><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="line-v"></div><div class="line-v2"></div></div>

<div class="cover">
<div class="corner-tl">━ ━ ━ ━ ━<br>━ ━ ━ ━</div>
<h1>{title}</h1><div class="line"></div>
<p class="sub">{subtitle}</p>
<p class="date">生成日期 · {date_str}</p>
<div class="deco-line"></div>
<div class="corner-br">━ ━ ━ ━<br>━ ━ ━ ━ ━</div>
</div>

<div class="section">
<h2><span class="num">1</span>数据概览<span class="bar"></span></h2>
{overview_html}
</div>

<div class="section">
<h2><span class="num">2</span>统计摘要<span class="bar"></span></h2>
<div class="stats-grid">{summary_html}</div>
</div>

{chart_html}

<div class="bg-dot-l">╱ ╲ ╱ ╲ ╱ ╲ ╱<br>╲ ╱ ╲ ╱ ╲ ╱ ╲<br>╱ ╲ ╱ ╲ ╱ ╲ ╱<br>╲ ╱ ╲ ╱ ╲ ╱ ╲</div>
<div class="bg-dot-r">╲ ╱ ╲ ╱ ╲ ╱ ╲<br>╱ ╲ ╱ ╲ ╱ ╲ ╱<br>╲ ╱ ╲ ╱ ╲ ╱ ╲<br>╱ ╲ ╱ ╲ ╱ ╲ ╱</div>
<div class="footer">CSV 数据可视化工具 · {date_str}</div>
<script>{JS}</script>
</body></html>'''

def gen_overview(nrows, ncols, fields):
    rows = ''
    for name, ftype in fields:
        badge = f'<span class="badge-{"num" if ftype=="数字" else "txt"}">{"数字" if ftype=="数字" else "文本"}</span>'
        rows += f'<tr><td style="width:35%">{name}</td><td>{badge}</td></tr>'
    return f'''<div class="info-box">
<div class="info-item"><div class="val">{nrows}</div><div class="lab">数据行数</div></div>
<div class="info-item"><div class="val">{ncols}</div><div class="lab">字段数量</div></div>
<div class="info-item"><div class="val">{sum(1 for _,t in fields if t=="数字")}</div><div class="lab">数字列</div></div>
<div class="info-item"><div class="val">{sum(1 for _,t in fields if t=="文本")}</div><div class="lab">文本列</div></div>
</div>
<table><tr><th>字段名</th><th>类型</th></tr>{rows}</table>'''

def gen_summary(stats):
    cards = ''
    for name, s in stats:
        cards += f'''<div class="stat-card"><h3>{name}</h3>
<p>数据量 <span class="sv">{s['n']}</span></p>
<p>平均值 <span class="sv">{s['avg']:.1f}</span></p>
<p>中位数 <span class="sv">{s['med']:.1f}</span></p>
<p>标准差 <span class="sv">{s['std']:.1f}</span></p>
<p>最小值 <span class="sv">{s['min']:.1f}</span></p>
<p>最大值 <span class="sv">{s['max']:.1f}</span></p>
</div>'''
    return cards

def gen_chart(name, labels, values):
    total = sum(values)
    mx = max(values) if values and max(values) > 0 else 1
    bar_max = 45
    chart = f'  {"":>8}  {"─" * 45}  {"":>12}\n'
    chart += f'  {"":>8}  频次  条形分布         占比\n'
    chart += f'  {"":>8}  {"─" * 45}  {"":>12}\n'
    for lab, val in zip(labels, values):
        bl = max(int(val * bar_max / mx), 1)
        level = min(int(val / mx * 10), 9)
        pct = val / total * 100 if total > 0 else 0
        bar = f'<span class="bar-{level}">{"█" * bl}</span>'
        chart += f'  {lab:>8} ┤{bar} {val:>2}({pct:>5.1f}%)\n'
    chart += f'  {"":>8} └{"─" * 45} {"─" * 18}\n'
    chart += f'  {"":>8} 合计 {total} 条\n'
    return chart

def create_html(output_path, data_csv, title="数据分析报告"):
    with open(data_csv, 'r', encoding='utf-8') as f:
        rows = list(csv.reader(f))
    hdr, data = rows[0], rows[1:]
    ncols, nrows = len(hdr), len(data)

    types = []
    for c in range(ncols):
        ok = True; vals = set()
        for r in data:
            v = r[c].strip()
            if v:
                vals.add(v)
                try: float(v)
                except: ok = False
        if ok and len(vals) == len(data):
            ok = False
        types.append("数字" if ok else "文本")

    overview_html = gen_overview(nrows, ncols, [(hdr[i], types[i]) for i in range(ncols)])

    stats_list = []
    for c in range(ncols):
        if types[c] != "数字": continue
        nums = [float(r[c].strip()) for r in data if r[c].strip()]
        if not nums: continue
        n = len(nums); a = sum(nums) / n; s = sorted(nums)
        std_val = math.sqrt(sum((x - a) ** 2 for x in nums) / n)
        stats_list.append((hdr[c], {'n':n,'min':min(nums),'max':max(nums),'avg':a,'med':s[n//2],'std':std_val}))
    summary_html = gen_summary(stats_list)

    chart_html = ''
    for c in range(ncols):
        if types[c] != "数字": continue
        ns = sorted([float(r[c].strip()) for r in data if r[c].strip()])
        if not ns: continue
        mn, mx = ns[0], ns[-1]
        rng = mx - mn if mx != mn else 1
        nb = 6; step = rng / nb
        lbs, vs = [], []
        for j in range(nb):
            lo = mn + j * step; hi = mx if j == nb - 1 else mn + (j + 1) * step
            vs.append(sum(1 for v in ns if lo <= v <= hi + 0.0001))
            lbs.append(f"{lo:.0f}~{hi:.0f}")
        chart_html += f'''<div class="section">
<h2><span class="num">{c+1}</span>{hdr[c]} 成绩分析 <span class="bar"></span></h2>
<div class="chart-box">
<h3>📊 频次分布柱状图</h3>
<div class="chart">{gen_chart(hdr[c], lbs, vs)}</div>
</div>
</div>'''

    now = datetime.now().strftime("%Y年%m月%d日")
    subtitle = f"数据源: {os.path.basename(data_csv)}"
    html = build_html(title, subtitle, now, overview_html, summary_html, chart_html)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"  报告已生成: {output_path}")

if __name__ == '__main__':
    csv_f=None;title="";output="report.html"
    i=1
    while i<len(sys.argv):
        a=sys.argv[i]
        if a in('--title','-t') and i+1<len(sys.argv):title=sys.argv[i+1];i+=2
        elif a in('--output','-o') and i+1<len(sys.argv):output=sys.argv[i+1];i+=2
        elif a in('--help','-h'):print("用法: python report.py <csv> [--title xxx] [--output xxx.html]");sys.exit(0)
        else:csv_f=a;i+=1
    if not title:
        try:
            with open('_title.txt','r',encoding='utf-8') as tf:
                title = tf.read().strip()
        except: pass
    if not title:
        title = os.path.splitext(os.path.basename(csv_f))[0] + " 数据分析报告"
    if not csv_f:print("请指定 CSV 文件");sys.exit(1)
    create_html(output,csv_f,title)
