#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <math.h>
#include <time.h>
#include <stdarg.h>
#include <windows.h>

#define MAX_COLS 32
#define MAX_ROWS 512
#define MAX_CELL 128
#define MAX_LINE 8192

typedef struct{char name[MAX_CELL];char(*data)[MAX_CELL];int count,is_num;}Col;
typedef struct{Col*cols;int ncols,nrows;}Tbl;

void trim(char*s){char*p=s,*e;while(*p&&isspace((unsigned char)*p))p++;if(p!=s)memmove(s,p,strlen(p)+1);e=s+strlen(s);while(e>s&&isspace((unsigned char)*(e-1)))*--e='\0';}
int parse_line(char*line,char*out[],int max){int n=0;char*p=line;while(*p&&n<max){if(*p=='"'){p++;out[n++]=p;while(*p){if(*p=='"'&&*(p+1)=='"'){memmove(p,p+1,strlen(p));p++;}else if(*p=='"'){*p='\0';p++;break;}p++;}}else{out[n++]=p;while(*p&&*p!=',')p++;}if(*p==','){*p='\0';p++;}trim(out[n-1]);}return n;}
int is_number(const char*s){if(!*s)return 0;int d=0;if(*s=='-')s++;if(!*s)return 0;while(*s){if(*s=='.'){if(d++)return 0;}else if(!isdigit((unsigned char)*s))return 0;s++;}return 1;}
int cmp_d(const void*a,const void*b){double da=*(const double*)a,db=*(const double*)b;return(da>db)-(da<db);}

int read_csv(const char*fn,Tbl*t){t->nrows=0;t->ncols=0;t->cols=NULL;
    FILE*f=fopen(fn,"r");if(!f){printf("  无法打开: %s\n",fn);return 0;}
    t->cols=malloc(MAX_COLS*sizeof(Col));char line[MAX_LINE],*fields[MAX_COLS];
    if(!fgets(line,sizeof(line),f)){fclose(f);return 0;}line[strcspn(line,"\r\n")]='\0';
    t->ncols=parse_line(line,fields,MAX_COLS);
    for(int i=0;i<t->ncols;i++){strncpy(t->cols[i].name,fields[i],MAX_CELL-1);t->cols[i].data=malloc(MAX_ROWS*MAX_CELL);t->cols[i].count=0;t->cols[i].is_num=0;}
    while(fgets(line,sizeof(line),f)&&t->nrows<MAX_ROWS){line[strcspn(line,"\r\n")]='\0';if(!*line)continue;int nf=parse_line(line,fields,t->ncols);int m=nf<t->ncols?nf:t->ncols;for(int i=0;i<m;i++)strncpy(t->cols[i].data[t->nrows],fields[i],MAX_CELL-1);for(int i=m;i<t->ncols;i++)t->cols[i].data[t->nrows][0]='\0';t->nrows++;}
    fclose(f);for(int i=0;i<t->ncols;i++)t->cols[i].count=t->nrows;
    for(int i=0;i<t->ncols;i++){int ok=1;for(int r=0;r<t->nrows;r++){if(!*t->cols[i].data[r])continue;if(!is_number(t->cols[i].data[r])){ok=0;break;}}t->cols[i].is_num=ok;}return 1;}
int col2dbl(Col*c,double*out){int n=0;for(int i=0;i<c->count;i++)if(*c->data[i])out[n++]=atof(c->data[i]);return n;}

typedef struct{double lo,hi;int cnt;}Bin;
void make_bins(double*d,int n,Bin*b,int nb){double mn=d[0],mx=d[0];for(int i=0;i<n;i++){if(d[i]<mn)mn=d[i];if(d[i]>mx)mx=d[i];}double rng=(mx-mn==0)?1:mx-mn,stp=rng/nb;for(int i=0;i<nb;i++){b[i].lo=mn+i*stp;b[i].hi=(i==nb-1)?mx+0.0001:mn+(i+1)*stp;b[i].cnt=0;}for(int i=0;i<n;i++)for(int j=0;j<nb;j++)if(d[i]>=b[j].lo&&d[i]<b[j].hi){b[j].cnt++;break;}}
typedef struct{int nb;double mn,mx;int counts[10];char labels[10][32];}BarData;
BarData build_bar(Col*c){BarData bd={0};double*d=malloc(c->count*sizeof(double));int n=col2dbl(c,d);if(n==0){free(d);return bd;}double mn=d[0],mx=d[0];for(int i=0;i<n;i++){if(d[i]<mn)mn=d[i];if(d[i]>mx)mx=d[i];}bd.nb=6;bd.mn=mn;bd.mx=mx;double rng=(mx-mn==0)?1:mx-mn,stp=rng/bd.nb;for(int i=0;i<bd.nb;i++){double lo=mn+i*stp,hi=(i==bd.nb-1)?mx+0.0001:mn+(i+1)*stp;snprintf(bd.labels[i],32,"%.0f-%.0f",lo,(i==bd.nb-1)?mx:hi);bd.counts[i]=0;}for(int i=0;i<n;i++)for(int j=0;j<bd.nb;j++)if(d[i]>=mn+j*stp&&d[i]<mn+(j+1)*stp){bd.counts[j]++;break;}free(d);return bd;}
typedef struct{int n;double min,max,avg,med,std,sum;}Stats;
Stats compute_stats(Col*c){Stats s={0};double*d=malloc(c->count*sizeof(double));s.n=col2dbl(c,d);if(s.n==0){free(d);return s;}s.min=s.max=d[0];for(int i=0;i<s.n;i++){if(d[i]<s.min)s.min=d[i];if(d[i]>s.max)s.max=d[i];s.sum+=d[i];}s.avg=s.sum/s.n;qsort(d,s.n,sizeof(double),cmp_d);s.med=(s.n%2==0)?(d[s.n/2-1]+d[s.n/2])/2.0:d[s.n/2];double var=0;for(int i=0;i<s.n;i++)var+=(d[i]-s.avg)*(d[i]-s.avg);s.std=sqrt(var/s.n);free(d);return s;}

/* ======================== CHARTS ======================== */
void bar_chart(Col*c){BarData bd=build_bar(c);
    printf("\n  +------- 柱状图: %s -------+\n",c->name);
    int mc=0;for(int j=0;j<bd.nb;j++)if(bd.counts[j]>mc)mc=bd.counts[j];if(mc==0)mc=1;
    for(int j=0;j<bd.nb;j++){int bl=bd.counts[j]*50/mc;if(bl==0&&bd.counts[j]>0)bl=1;
        printf("  %-10s |",bd.labels[j]);for(int k=0;k<bl;k++)putchar('#');printf(" %d\n",bd.counts[j]);}
    printf("  %-10s +","");for(int j=0;j<70;j++)putchar('-');printf("\n\n");}

void line_chart(Col*c){double*d=malloc(c->count*sizeof(double));int n=col2dbl(c,d);
    printf("\n  +------- 折线图: %s (前20个数据点) -------+\n",c->name);
    if(n<2){printf("  至少需要2个数据点\n");free(d);return;}
    double mn=d[0],mx=d[0];for(int i=0;i<n;i++){if(d[i]<mn)mn=d[i];if(d[i]>mx)mx=d[i];}
    double rng=(mx-mn==0)?1:mx-mn;int W=70,H=12;
    char*g=malloc((H+1)*(W+1));memset(g,' ',(H+1)*(W+1));
    int pn=n<20?n:20;int*x=malloc(pn*sizeof(int)),*y=malloc(pn*sizeof(int));
    for(int i=0;i<pn;i++){x[i]=(int)((double)i/(pn-1)*(W-1));
        y[i]=H-1-(int)((d[i]-mn)/rng*(H-1));if(y[i]<0)y[i]=0;if(y[i]>=H)y[i]=H-1;}
    /* draw ALL intermediate points between each pair */
    for(int k=0;k<pn-1;k++){
        int x1=x[k],y1=y[k],x2=x[k+1],y2=y[k+1];
        int steps=abs(x2-x1);if(abs(y2-y1)>steps)steps=abs(y2-y1);
        if(steps<1)steps=1;
        for(int t=1;t<steps;t++){
            int xx=x1+(x2-x1)*t/steps;
            int yy=y1+(y2-y1)*t/steps;
            if(yy>=0&&yy<H&&xx>=0&&xx<W){
                char c='-';
                if(y2<y1)c='/'; else if(y2>y1)c='\\';
                g[yy*(W+1)+xx]=c;
            }
        }
    }
    for(int i=0;i<pn;i++)g[y[i]*(W+1)+x[i]]='*';
    for(int y=0;y<H;y++){double val=mx-(double)y/(H-1)*rng;printf("  %7.1f |",val);for(int x=0;x<W;x++)putchar(g[y*(W+1)+x]);printf("\n");}
    printf("  %7s +","");for(int x=0;x<W;x++)putchar('-');printf("\n");
    printf("  %7s  ","");for(int i=0;i<pn;i++){if(i%((pn-1)/4<1?1:(pn-1)/4)==0||i==pn-1)printf("%-4d",i+1);}printf("\n\n");
    free(d);free(g);free(x);free(y);}

void pie_chart(Col*c){printf("\n  +------- 饼状图: %s -------+\n",c->name);
    typedef struct{char*label;int cnt;}Cat;Cat cats[200];int nc=0;
    for(int i=0;i<c->count;i++){char*v=c->data[i];if(!*v)continue;int f=0;for(int j=0;j<nc;j++)if(strcmp(cats[j].label,v)==0){cats[j].cnt++;f=1;break;}if(!f&&nc<200){cats[nc].label=v;cats[nc].cnt=1;nc++;}}
    int tot=0;for(int i=0;i<nc;i++)tot+=cats[i].cnt;if(tot==0){printf("  无数据\n");return;}
    for(int i=0;i<nc-1;i++)for(int j=i+1;j<nc;j++)if(cats[j].cnt>cats[i].cnt){Cat t=cats[i];cats[i]=cats[j];cats[j]=t;}
    int R=16,W=R*2+1,*sec=malloc(W*W*sizeof(int));for(int i=0;i<W*W;i++)sec[i]=-1;
    double*ang=malloc(nc*sizeof(double));double run=0;for(int i=0;i<nc;i++){run+=(double)cats[i].cnt/tot*360;ang[i]=run;}
    int H=R/2;for(int dy=-H;dy<=H;dy++){int dx_max=(int)sqrt((double)R*R-((double)dy*2)*((double)dy*2));if(dx_max<0)dx_max=0;
        for(int dx=-dx_max;dx<=dx_max;dx++){double a=atan2((double)dy*2,(double)dx)*180/3.14159+180;int idx=(dy+H)*W+(dx+R);if(idx>=0&&idx<W*W)for(int i=0;i<nc;i++)if(a<=ang[i]){sec[idx]=i;break;}}}
    const char*chs="0123456789ABCDEFGH";
    printf("  ");for(int i=0;i<W+2;i++)putchar('_');printf("\n");
    for(int dy=-R;dy<=R;dy++){printf("  |");for(int dx=-R;dx<=R;dx++){int idx=(dy+R)*W+(dx+R);putchar(sec[idx]>=0?chs[sec[idx]%18]:' ');}printf("|\n");}
    printf("  ");for(int i=0;i<W+2;i++)putchar('-');printf("\n");
    printf("\n  图例:\n");for(int i=0;i<nc;i++)printf("    %c = %-14s %d (%.1f%%)\n",chs[i%18],cats[i].label,cats[i].cnt,(double)cats[i].cnt/tot*100);free(sec);free(ang);}
void pie_num(Col*c){double*d=malloc(c->count*sizeof(double));int n=col2dbl(c,d);
    printf("\n  +------- 饼状图: %s -------+\n",c->name);
    int cnt[5]={0};const char*lbs[]={"优秀(>=90)","良好(80-89)","中等(70-79)","及格(60-69)","不及格(<60)"};
    for(int i=0;i<n;i++){if(d[i]>=90)cnt[0]++;else if(d[i]>=80)cnt[1]++;else if(d[i]>=70)cnt[2]++;else if(d[i]>=60)cnt[3]++;else cnt[4]++;}
    int R=16,W=R*2+1,*sec=malloc(W*W*sizeof(int));for(int i=0;i<W*W;i++)sec[i]=-1;
    double*ang=malloc(5*sizeof(double));double run=0;for(int i=0;i<5;i++){if(cnt[i]==0)continue;run+=(double)cnt[i]/n*360;ang[i]=run;}
    int H=R/2;for(int dy=-H;dy<=H;dy++){int dx_max=(int)sqrt((double)R*R-((double)dy*2)*((double)dy*2));if(dx_max<0)dx_max=0;
        for(int dx=-dx_max;dx<=dx_max;dx++){double a=atan2((double)dy*2,(double)dx)*180/3.14159+180;int idx=(dy+H)*W+(dx+R);if(idx>=0&&idx<W*W)for(int i=0;i<5;i++)if(a<=ang[i]){sec[idx]=i;break;}}}
    printf("  ");for(int i=0;i<W+2;i++)putchar('_');printf("\n");
    for(int dy=-H;dy<=H;dy++){printf("  |");for(int dx=-R;dx<=R;dx++){int idx=(dy+H)*W+(dx+R);putchar(idx>=0&&idx<W*W&&sec[idx]>=0?"0123456789ABCDEFGH"[sec[idx]]:' ');}printf("|\n");}
    printf("  ");for(int i=0;i<W+2;i++)putchar('-');printf("\n");
    printf("\n  图例:\n");for(int i=0;i<5;i++){if(cnt[i]==0)continue;printf("    %d = %-14s %d (%.1f%%)\n",i,lbs[i],cnt[i],(double)cnt[i]/n*100);}free(d);free(sec);free(ang);}

void print_stats(Col*c){Stats s=compute_stats(c);
    printf("\n  +------- 统计摘要: %s -------+\n",c->name);
    printf("  数据量   : %d\n",s.n);printf("  最小值   : %.2f\n",s.min);
    printf("  最大值   : %.2f\n",s.max);printf("  平均值   : %.2f\n",s.avg);
    printf("  中位数   : %.2f\n",s.med);printf("  标准差   : %.2f\n",s.std);
    printf("  总和     : %.2f\n\n",s.sum);}

void preview(Tbl*t){printf("\n  数据预览 (%d 列 x %d 行)\n\n",t->ncols,t->nrows);
    for(int i=0;i<t->ncols;i++)printf("  %-12s",t->cols[i].name);printf("\n");
    for(int i=0;i<t->ncols;i++)printf("  %-12s","------------");printf("\n");
    int s=t->nrows<8?t->nrows:8;for(int r=0;r<s;r++){for(int c=0;c<t->ncols;c++)printf("  %-12s",t->cols[c].data[r]);printf("\n");}
    if(t->nrows>8)printf("  ... (还有 %d 行)\n\n",t->nrows-8);else printf("\n");}

/* ======================== REPORT ======================== */
FILE*rpt=NULL;
void p(const char*fmt,...){va_list ap;va_start(ap,fmt);vprintf(fmt,ap);va_end(ap);if(rpt){va_start(ap,fmt);vfprintf(rpt,fmt,ap);va_end(ap);}}
void hline(int w){for(int i=0;i<w;i++)p("=");p("\n");}
void thin(int w){for(int i=0;i<w;i++)p("-");p("\n");}
void cover_page(const char*title,const char*file){time_t now=time(NULL);char date[64];strftime(date,64,"%Y年%m月%d日",localtime(&now));p("\n");hline(64);p("  %s\n",title[0]?title:"CSV 数据分析报告");p("  ----------------------------------------------------------------\n");p("  数据源: %s\n",file);p("  生成日期: %s\n",date);hline(64);p("\n");}
void data_overview(Tbl*t){p("\n");thin(64);p("  第二章 数据概览\n");thin(64);p("  总行数: %d      总列数: %d\n\n",t->nrows,t->ncols);p("  字段列表:\n");for(int i=0;i<t->ncols;i++)p("    [%d] %-16s (%s)\n",i+1,t->cols[i].name,t->cols[i].is_num?"数值":"文本");}
void summary_section(Tbl*t){p("\n");thin(64);p("  第三章 统计摘要\n");thin(64);for(int i=0;i<t->ncols;i++){if(!t->cols[i].is_num)continue;Stats s=compute_stats(&t->cols[i]);p("\n  --- %s ---\n",t->cols[i].name);p("  数据量: %d\n",s.n);p("  最小值: %.2f\n",s.min);p("  最大值: %.2f\n",s.max);p("  平均值: %.2f\n",s.avg);p("  中位数: %.2f\n",s.med);p("  标准差: %.2f\n",s.std);p("  总和: %.2f\n",s.sum);}}
void chart_section(Tbl*t){p("\n");thin(64);p("  第四章 数据可视化\n");thin(64);for(int i=0;i<t->ncols;i++){if(!t->cols[i].is_num)continue;BarData bd=build_bar(&t->cols[i]);p("\n  [%s] 频次分布直方图\n\n",t->cols[i].name);int mc=0;for(int j=0;j<bd.nb;j++)if(bd.counts[j]>mc)mc=bd.counts[j];if(mc==0)mc=1;for(int j=0;j<bd.nb;j++){int bl=bd.counts[j]*50/mc;if(bl==0&&bd.counts[j]>0)bl=1;p("  %-10s |",bd.labels[j]);for(int k=0;k<bl;k++)p("#");p(" %d\n",bd.counts[j]);}p("  %-10s +","");for(int j=0;j<60;j++)p("-");p("\n");}}
void closing_page(){p("\n");hline(64);p("  报告结束\n");p("  感谢使用 CSV 数据可视化工具\n");hline(64);p("\n");}
void gen_report(Tbl*t,const char*title,const char*outfile){rpt=fopen(outfile,"w");if(!rpt){printf("  无法创建报告文件: %s\n",outfile);return;}cover_page(title,"数据源");data_overview(t);summary_section(t);chart_section(t);closing_page();fclose(rpt);rpt=NULL;printf("  报告已生成: %s\n\n",outfile);}

/* ======================== MAIN ======================== */
int main(int argc,char*argv[]){
    SetConsoleOutputCP(65001);SetConsoleCP(65001);
    Tbl tbl={0};char fn[512]="",title[256]="",outfile[256]="";
    int auto_mode=0;
    system("cls");

    for(int i=1;i<argc;i++){
        if(strcmp(argv[i],"--title")==0||strcmp(argv[i],"-t")==0){if(i+1<argc)strncpy(title,argv[++i],255);}
        else if(strcmp(argv[i],"--output")==0||strcmp(argv[i],"-o")==0){if(i+1<argc){strncpy(outfile,argv[++i],255);auto_mode=1;}}
        else if(strcmp(argv[i],"--help")==0||strcmp(argv[i],"-h")==0){
            printf("\n  CSV 数据可视化工具 v3\n");
            printf("  用法: csv_viz.exe <文件.csv> [选项]\n\n");
            printf("  选项:\n");
            printf("    --title, -t <标题>    报告标题\n");
            printf("    --output, -o <文件>   输出文本报告\n");
            printf("    --help, -h            帮助\n\n");
            return 0;}else if(!*fn)strncpy(fn,argv[i],511);}

    printf("\n  ========================================\n");
    printf("       CSV 数据可视化工具 v3\n");
    printf("  ========================================\n\n");

    if(!*fn){printf("  请输入 CSV 文件路径 (回车=演示数据): ");if(!fgets(fn,sizeof(fn),stdin))return 1;fn[strcspn(fn,"\r\n")]='\0';}
    if(!*fn){printf("  正在生成演示数据...\n");FILE*f=fopen("_data.csv","w");fprintf(f,"ID,Name,Math,English,C_Lang,Total\n");const char*ns[]={"Alice","Bob","Carol","David","Eve","Frank","Grace","Henry","Ivy","Jack","Kate","Leo","Mary","Nick","Olivia","Paul","Quinn","Rose","Sam","Tina","Uma","Victor","Wendy","Xavier","Yara","Zack","Amy","Ben","Cathy","Dan","Ella","Finn","Gina","Hank","Isla","Jake","Kara","Liam","Mona","Nate","Oscar","Paula","Quincy","Rita","Steve","Tracy","Ulysses","Vera","Will","Xenia","Yuri"};for(int i=0;i<50;i++){int mt=40+rand()%60,en=45+rand()%55,cl=35+rand()%65;fprintf(f,"%d,%s,%d,%d,%d,%d\n",i+1,ns[i],mt,en,cl,mt+en+cl);}fclose(f);strcpy(fn,"_data.csv");}
    if(!read_csv(fn,&tbl))return 1;

    if(auto_mode||*outfile){
        if(!*title)snprintf(title,256,"%s 数据分析报告",fn);
        if(!*outfile)snprintf(outfile,256,"report.txt");
        gen_report(&tbl,title,outfile);
        FILE*fp=fopen("_title.txt","w");fprintf(fp,"%s",title);fclose(fp);
        char cmd[1024];snprintf(cmd,1024,"C:\\Users\\WaKoBe\\AppData\\Local\\Programs\\Python\\Python314\\python.exe C:\\Users\\WaKoBe\\report_html.py \"%s\" --output report.html",fn);
        system(cmd);return 0;}

    while(1){
        system("cls");
        printf("\n  ========================================\n");
        printf("       CSV 数据可视化工具 v3\n");
        printf("  ========================================\n");
        preview(&tbl);
        printf("  数据列:\n");
        for(int i=0;i<tbl.ncols;i++)printf("    [%d] %s (%s)\n",i+1,tbl.cols[i].name,tbl.cols[i].is_num?"数字":"文本");
        printf("\n  输入列号 (0=退出, 99=报告): ");
        int col;scanf("%d",&col);while(getchar()!='\n');
        if(col==0)break;
        if(col==99){
            if(!*title){printf("  报告标题: ");fgets(title,sizeof(title),stdin);title[strcspn(title,"\r\n")]='\0';}
            if(!*title)snprintf(title,256,"%s 数据分析报告",fn);
            snprintf(outfile,256,"report_%ld.txt",time(NULL));
            gen_report(&tbl,title,outfile);
            FILE*fp=fopen("_title.txt","w");fprintf(fp,"%s",title);fclose(fp);
            char cmd[1024];snprintf(cmd,1024,"C:\\Users\\WaKoBe\\AppData\\Local\\Programs\\Python\\Python314\\python.exe C:\\Users\\WaKoBe\\report_html.py \"%s\" --output report.html",fn);
            printf("  正在生成 HTML 报告...\n");system(cmd);printf("  HTML 报告: report.html\n");
            printf("  按 Enter 继续...");getchar();continue;}
        if(col<1||col>tbl.ncols){printf("  无效!\n");printf("  按 Enter 继续...");getchar();continue;}
        Col*colptr=&tbl.cols[col-1];
        system("cls");
        printf("\n  [%s] 选择图表类型:\n",colptr->name);
        printf("    [1] 柱状图  [2] 折线图  [3] 饼状图  [4] 统计摘要  [0] 返回\n  请选择: ");
        int ct;scanf("%d",&ct);while(getchar()!='\n');
        if(ct==0)continue;
        system("cls");
        switch(ct){case 1:bar_chart(colptr);break;case 2:line_chart(colptr);break;case 3:if(colptr->is_num)pie_num(colptr);else pie_chart(colptr);break;case 4:print_stats(colptr);break;default:printf("  无效!\n");}
        printf("  按 Enter 继续...");getchar();}
    printf("\n  再见！\n\n");return 0;}
