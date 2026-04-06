import { BookOpen, Zap, Heart, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "መጽሐፍ ቅዱሳዊ",
    description: "ሁሉም ግብዓቶች ከፕሮቴስታንት መጽሐፍ ቅዱሳዊ ትምህርት ጋር የተጣጣሙ ናቸው",
    stat: "100%",
    statLabel: "የተረጋገጠ",
  },
  {
    icon: Zap,
    title: "በየትኛውም ቦታ ያንብቡ",
    description: "ቤተ-መጻሕፍትዎን በማንኛውም መሣሪያ፣ በማንኛውም ጊዜ ያግኙ",
    stat: "24/7",
    statLabel: "ተደራሽ",
  },
  {
    icon: Heart,
    title: "Free",
    description: "ምንም የተደበቀ ክፍያ ወይም የደንበኝነት ምዝገባ አያስፈልግም",
    stat: "100%",
    statLabel: "ነፃ",
  },
];

export default function FeaturesGrid() {
  return (
    <section className="py-12 sm:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border mb-3">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold">Why Hena Books?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Built for Believers
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Everything you need to grow in faith, all in one place
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl bg-background border border-border hover:border-navy-300 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-navy-gradient flex items-center justify-center shadow group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-navy-500">{f.stat}</div>
                  <div className="text-xs text-muted-foreground">{f.statLabel}</div>
                </div>
              </div>
              <h3 className="font-bold text-base mb-1.5">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
