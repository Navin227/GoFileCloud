import { Link } from "react-router-dom";
import { FileType, Minimize2, Scissors, FileText, ArrowRight } from "lucide-react";

const tools = [
  {
    id: "converter",
    name: "File Converter",
    description: "Convert files between formats",
    icon: FileType,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    href: "/tools/converter",
  },
  {
    id: "compressor",
    name: "Compressor",
    description: "Reduce file size without losing quality",
    icon: Minimize2,
    color: "bg-green-500/10 text-green-400 border-green-500/20",
    href: "/tools/compressor",
  },
  {
    id: "splitter",
    name: "File Splitter",
    description: "Split large files into smaller parts",
    icon: Scissors,
    color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    href: "/tools/splitter",
  },
  {
    id: "summarizer",
    name: "AI Summarizer",
    description: "Get AI-powered document summaries",
    icon: FileText,
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    href: "/tools/summarizer",
  },
];

export function ToolsSection() {
  return (
    <section className="p-6 border-b border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-section-title font-semibold text-foreground">File Tools</h2>
        <Link 
          to="/tools" 
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              to={tool.href}
              className="group p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <div className={`h-10 w-10 rounded-lg ${tool.color} border flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
