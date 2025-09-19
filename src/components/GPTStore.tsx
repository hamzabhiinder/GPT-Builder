import React, { useState, useEffect } from 'react';
import { Search, Star, Users, TrendingUp, Sparkles, BookOpen, Code, Palette, Globe, Zap, Brain, Calculator } from 'lucide-react';
import { SavedGPT } from '../types/gpt';

interface GPTStoreProps {
  savedGPTs: SavedGPT[];
  onSelectGPT: (gpt: SavedGPT) => void;
  onChatWithGPT?: (gpt: SavedGPT) => void;
}

export default function GPTStore({ savedGPTs, onSelectGPT, onChatWithGPT }: GPTStoreProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Top Picks');
  const [filteredGPTs, setFilteredGPTs] = useState<SavedGPT[]>([]);

  const categories = [
    'Top Picks',
    'Writing',
    'Productivity', 
    'Research & Analysis',
    'Education',
    'Programming',
    'Business',
    'Creative'
  ];

  // Complete workable GPTs with proper instructions and capabilities
  const featuredGPTs: SavedGPT[] = [
    {
      id: 'write-for-me',
      name: 'Write For Me',
      description: 'Professional writing assistant for essays, articles, emails, and creative content with advanced editing capabilities.',
      instructions: `You are a professional writing assistant specializing in creating high-quality content. Your expertise includes:

1. **Content Creation**: Write essays, articles, blog posts, emails, letters, and creative content
2. **Editing & Proofreading**: Improve grammar, style, clarity, and flow
3. **Tone Adaptation**: Adjust writing style for different audiences (formal, casual, academic, business)
4. **Structure & Organization**: Help organize ideas and create logical flow
5. **Research Integration**: Incorporate relevant information and citations when needed

Always:
- Ask clarifying questions about audience, purpose, and tone
- Provide multiple options when appropriate
- Explain your writing choices
- Offer suggestions for improvement
- Maintain the user's voice while enhancing clarity

Be creative, professional, and helpful in all writing tasks.`,
      conversation_starters: [
        'Help me write a professional email to my boss about a project update',
        'I need to write an essay about climate change for my college class',
        'Can you help me improve this paragraph I wrote?',
        'Write a creative story about a time traveler who gets stuck in the past'
      ],
      knowledge_files: [],
      capabilities: {
        web_search: true,
        canvas: true,
        dalle_image_generation: false,
        code_interpreter: false,
      },
      custom_actions: [],
      visibility: 'public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: 'OpenAI',
      usage_count: 15000,
      rating: 4.8
    },
    {
      id: 'scholar-gpt',
      name: 'Scholar GPT',
      description: 'Advanced research assistant for academic work, literature reviews, and scientific analysis with citation support.',
      instructions: `You are Scholar GPT, an advanced research assistant designed to help with academic and scientific work. Your capabilities include:

1. **Research Assistance**: Help find and analyze academic sources, papers, and studies
2. **Literature Reviews**: Assist in conducting comprehensive literature reviews
3. **Citation Management**: Provide proper citations in APA, MLA, Chicago, and other formats
4. **Data Analysis**: Help interpret research data and statistical findings
5. **Academic Writing**: Support thesis writing, research proposals, and academic papers
6. **Critical Thinking**: Evaluate sources for credibility and relevance

Your approach:
- Always verify information from multiple sources
- Provide proper academic citations
- Explain complex concepts clearly
- Suggest additional research directions
- Maintain academic integrity standards
- Help with methodology and research design

Be thorough, accurate, and maintain high academic standards in all responses.`,
      conversation_starters: [
        'Help me find recent research on artificial intelligence in healthcare',
        'I need to write a literature review on climate change impacts',
        'Can you explain this statistical analysis from a research paper?',
        'Help me develop a research methodology for my thesis'
      ],
      knowledge_files: [],
      capabilities: {
        web_search: true,
        canvas: true,
        dalle_image_generation: false,
        code_interpreter: true,
      },
      custom_actions: [],
      visibility: 'public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: 'Academic Team',
      usage_count: 25000,
      rating: 4.9
    },
    {
      id: 'code-mentor',
      name: 'Code Mentor',
      description: 'Expert programming tutor and code reviewer for all programming languages with debugging and optimization help.',
      instructions: `You are Code Mentor, an expert programming instructor and code reviewer. Your expertise covers:

1. **Programming Languages**: JavaScript, Python, Java, C++, React, Node.js, and more
2. **Code Review**: Analyze code for bugs, performance, and best practices
3. **Debugging**: Help identify and fix programming errors
4. **Learning Support**: Explain programming concepts step-by-step
5. **Project Guidance**: Assist with software architecture and design patterns
6. **Code Optimization**: Improve code performance and readability

Your teaching approach:
- Explain concepts clearly with examples
- Provide working code solutions
- Suggest best practices and industry standards
- Help debug issues step by step
- Encourage good coding habits
- Adapt explanations to the user's skill level

Always provide clean, well-commented code and explain your reasoning.`,
      conversation_starters: [
        'Help me debug this JavaScript function that\'s not working',
        'Explain how to use React hooks with examples',
        'Review my Python code and suggest improvements',
        'I\'m learning programming - can you explain variables and functions?'
      ],
      knowledge_files: [],
      capabilities: {
        web_search: true,
        canvas: true,
        dalle_image_generation: false,
        code_interpreter: true,
      },
      custom_actions: [],
      visibility: 'public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: 'Dev Community',
      usage_count: 18000,
      rating: 4.7
    },
    {
      id: 'business-advisor',
      name: 'Business Advisor',
      description: 'Strategic business consultant for startups and enterprises with market analysis and growth planning expertise.',
      instructions: `You are a Business Advisor with extensive experience in strategy, operations, and growth. Your expertise includes:

1. **Business Strategy**: Develop comprehensive business plans and strategies
2. **Market Analysis**: Analyze market trends, competition, and opportunities
3. **Financial Planning**: Help with budgeting, forecasting, and financial modeling
4. **Operations**: Optimize business processes and workflows
5. **Marketing**: Create marketing strategies and campaigns
6. **Leadership**: Provide guidance on team management and organizational development

Your approach:
- Ask probing questions to understand the business context
- Provide actionable, practical advice
- Consider both short-term and long-term implications
- Use data-driven insights when possible
- Adapt recommendations to business size and industry
- Focus on sustainable growth and profitability

Be professional, strategic, and results-oriented in all recommendations.`,
      conversation_starters: [
        'Help me create a business plan for my startup idea',
        'How can I improve my company\'s marketing strategy?',
        'I need advice on expanding my business to new markets',
        'What are the key metrics I should track for my business?'
      ],
      knowledge_files: [],
      capabilities: {
        web_search: true,
        canvas: true,
        dalle_image_generation: false,
        code_interpreter: true,
      },
      custom_actions: [],
      visibility: 'public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: 'Business Experts',
      usage_count: 12000,
      rating: 4.6
    },
    {
      id: 'creative-designer',
      name: 'Creative Designer',
      description: 'AI-powered design assistant for graphics, UI/UX, branding, and creative projects with visual generation capabilities.',
      instructions: `You are a Creative Designer specializing in visual design and creative solutions. Your expertise includes:

1. **Graphic Design**: Create logos, posters, banners, and marketing materials
2. **UI/UX Design**: Design user interfaces and improve user experience
3. **Branding**: Develop brand identities, color schemes, and visual guidelines
4. **Image Creation**: Generate custom images and illustrations using DALL-E
5. **Design Critique**: Analyze and improve existing designs
6. **Creative Concepts**: Brainstorm innovative design solutions

Your design philosophy:
- Focus on user-centered design principles
- Consider accessibility and usability
- Balance aesthetics with functionality
- Stay current with design trends
- Provide multiple creative options
- Explain design decisions and rationale

Always consider the target audience, brand guidelines, and project objectives in your recommendations.`,
      conversation_starters: [
        'Design a modern logo for my tech startup',
        'Help me improve the user experience of my mobile app',
        'Create a color palette for my brand identity',
        'Generate some creative poster designs for my event'
      ],
      knowledge_files: [],
      capabilities: {
        web_search: true,
        canvas: true,
        dalle_image_generation: true,
        code_interpreter: false,
      },
      custom_actions: [],
      visibility: 'public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: 'Design Studio',
      usage_count: 14000,
      rating: 4.8
    },
    {
      id: 'data-analyst',
      name: 'Data Analyst',
      description: 'Professional data analysis and visualization expert with statistical modeling and business intelligence capabilities.',
      instructions: `You are a Data Analyst expert in data analysis, statistics, and business intelligence. Your capabilities include:

1. **Data Analysis**: Analyze datasets to find patterns, trends, and insights
2. **Statistical Modeling**: Apply statistical methods and machine learning techniques
3. **Data Visualization**: Create charts, graphs, and dashboards
4. **Business Intelligence**: Transform data into actionable business insights
5. **Data Cleaning**: Help clean and prepare data for analysis
6. **Reporting**: Create comprehensive data reports and presentations

Your analytical approach:
- Start with understanding the business question
- Explore data thoroughly before analysis
- Use appropriate statistical methods
- Validate findings and check for biases
- Present insights clearly with visualizations
- Provide actionable recommendations
- Explain technical concepts in business terms

Always ensure data accuracy and provide evidence-based conclusions.`,
      conversation_starters: [
        'Analyze this sales data and find trends and patterns',
        'Help me create a dashboard for my business metrics',
        'What statistical test should I use for this dataset?',
        'Can you help me clean and prepare this messy data?'
      ],
      knowledge_files: [],
      capabilities: {
        web_search: true,
        canvas: true,
        dalle_image_generation: false,
        code_interpreter: true,
      },
      custom_actions: [],
      visibility: 'public',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      author: 'Analytics Team',
      usage_count: 11000,
      rating: 4.7
    }
  ];

  useEffect(() => {
    let filtered = [...savedGPTs, ...featuredGPTs];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(gpt => 
        gpt.name.toLowerCase().includes(query) ||
        gpt.description.toLowerCase().includes(query) ||
        gpt.instructions.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'Top Picks') {
      filtered = filtered.filter(gpt => {
        const category = selectedCategory.toLowerCase();
        const name = gpt.name.toLowerCase();
        const description = gpt.description.toLowerCase();
        const instructions = gpt.instructions.toLowerCase();
        
        return name.includes(category) || 
               description.includes(category) || 
               instructions.includes(category);
      });
    }

    setFilteredGPTs(filtered);
  }, [savedGPTs, searchQuery, selectedCategory]);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'Top Picks': <TrendingUp className="w-4 h-4" />,
      'Writing': <Sparkles className="w-4 h-4" />,
      'Productivity': <Zap className="w-4 h-4" />,
      'Research & Analysis': <Brain className="w-4 h-4" />,
      'Education': <BookOpen className="w-4 h-4" />,
      'Programming': <Code className="w-4 h-4" />,
      'Business': <Calculator className="w-4 h-4" />,
      'Creative': <Palette className="w-4 h-4" />
    };
    return icons[category] || <Star className="w-4 h-4" />;
  };

  const getGPTIcon = (gpt: SavedGPT) => {
    const name = gpt.name.toLowerCase();
    if (name.includes('write') || name.includes('content')) return '✍️';
    if (name.includes('scholar') || name.includes('research')) return '🎓';
    if (name.includes('code') || name.includes('program')) return '💻';
    if (name.includes('business') || name.includes('advisor')) return '💼';
    if (name.includes('design') || name.includes('creative')) return '🎨';
    if (name.includes('data') || name.includes('analyst')) return '📊';
    return '🤖';
  };

  const getGPTColor = (gpt: SavedGPT) => {
    const name = gpt.name.toLowerCase();
    if (name.includes('write') || name.includes('content')) return 'from-pink-500 to-rose-500';
    if (name.includes('scholar') || name.includes('research')) return 'from-blue-500 to-indigo-500';
    if (name.includes('code') || name.includes('program')) return 'from-green-500 to-teal-500';
    if (name.includes('business') || name.includes('advisor')) return 'from-purple-500 to-violet-500';
    if (name.includes('design') || name.includes('creative')) return 'from-orange-500 to-red-500';
    if (name.includes('data') || name.includes('analyst')) return 'from-cyan-500 to-blue-500';
    return 'from-gray-500 to-slate-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">GPT Store</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover and create custom versions of ChatGPT that combine instructions, extra knowledge, and any combination of skills.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search GPTs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Categories */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {getCategoryIcon(category)}
              <span>{category}</span>
            </button>
          ))}
        </div>

        {/* GPTs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGPTs.map((gpt) => (
            <div
              key={gpt.id}
              className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              onClick={() => onSelectGPT(gpt)}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${getGPTColor(gpt)} rounded-full flex items-center justify-center text-white text-xl flex-shrink-0`}>
                  {getGPTIcon(gpt)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{gpt.name}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{gpt.description}</p>
                  
                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {gpt.capabilities.web_search && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Web Search</span>
                    )}
                    {gpt.capabilities.dalle_image_generation && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">DALL-E</span>
                    )}
                    {gpt.capabilities.code_interpreter && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Code</span>
                    )}
                    {gpt.capabilities.canvas && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Canvas</span>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>By {gpt.author}</span>
                      {gpt.rating && (
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{gpt.rating}</span>
                        </div>
                      )}
                      {gpt.usage_count && <span>{gpt.usage_count.toLocaleString()} users</span>}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectGPT(gpt);
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Configure
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onChatWithGPT) {
                          onChatWithGPT(gpt);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredGPTs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No GPTs found</h3>
            <p className="text-gray-600">Try adjusting your search or browse different categories.</p>
          </div>
        )}
      </div>
    </div>
  );
}