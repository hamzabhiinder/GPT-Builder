import React, { useState, useEffect } from 'react';
import { Search, Star, Users, TrendingUp, Sparkles, BookOpen, Code, Palette } from 'lucide-react';
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
    'Lifestyle',
    'DALL-E',
    'Programming'
  ];

  const featuredGPTs = [
    {
      id: 'write-for-me',
      name: 'Write For Me',
      description: 'Supercharged writing assistant ⚡',
      author: 'poe.today',
      icon: '✍️',
      color: 'from-pink-500 to-rose-500',
      rating: 4.8,
      usage_count: 15000
    },
    {
      id: 'scholar-gpt',
      name: 'Scholar GPT',
      description: 'Enhance research with 200M+ resources and built-in critical reading skills. Access Google Scholar, PubMed, JSTOR, Arxiv, and more.',
      author: 'awesomegpts.ai',
      icon: '🎓',
      color: 'from-blue-500 to-indigo-500',
      rating: 4.9,
      usage_count: 25000
    },
    {
      id: 'consensus',
      name: 'Consensus',
      description: 'Ask the research, chat directly with the world\'s scientific literature. Search references, get science-based answers instantly.',
      author: 'consensus.app',
      icon: '🔬',
      color: 'from-green-500 to-teal-500',
      rating: 4.7,
      usage_count: 18000
    },
    {
      id: 'ai-pdf-drive',
      name: 'AI PDF Drive: Chat, Create, Organize',
      description: 'Advanced AI agents for legal and professional work. Upload briefs, contracts and other documents to get started.',
      author: 'myaidrive.com',
      icon: '📄',
      color: 'from-red-500 to-orange-500',
      rating: 4.6,
      usage_count: 12000
    }
  ];

  useEffect(() => {
    let filtered = savedGPTs.filter(gpt => 
      gpt.visibility === 'public' &&
      (gpt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       gpt.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (selectedCategory !== 'Top Picks') {
      // Filter by category logic here
      filtered = filtered.filter(gpt => 
        gpt.name.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        gpt.description.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    setFilteredGPTs(filtered);
  }, [savedGPTs, searchQuery, selectedCategory]);

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'Top Picks': <TrendingUp className="w-4 h-4" />,
      'Writing': <Sparkles className="w-4 h-4" />,
      'Productivity': <Users className="w-4 h-4" />,
      'Research & Analysis': <Search className="w-4 h-4" />,
      'Education': <BookOpen className="w-4 h-4" />,
      'Lifestyle': <Star className="w-4 h-4" />,
      'DALL-E': <Palette className="w-4 h-4" />,
      'Programming': <Code className="w-4 h-4" />
    };
    return icons[category] || <Star className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">GPTs</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover and create custom versions of ChatGPT that combine instructions, extra knowledge, and any combination of skills.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search GPTs"
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

        {/* Featured Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured</h2>
            <p className="text-gray-600">Curated top picks from this week</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredGPTs.map((gpt) => (
              <div
                key={gpt.id}
                className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onChatWithGPT ? onChatWithGPT(gpt as any) : onSelectGPT(gpt as any)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${gpt.color} rounded-full flex items-center justify-center text-white text-xl`}>
                    {gpt.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{gpt.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{gpt.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>By {gpt.author}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{gpt.rating}</span>
                        </div>
                        <span>{gpt.usage_count?.toLocaleString()} users</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectGPT(gpt as any);
                          }}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onChatWithGPT && onChatWithGPT(gpt as any);
                          }}
                          className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                        >
                          Chat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Created GPTs */}
        {filteredGPTs.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your GPTs</h2>
              <p className="text-gray-600">GPTs you've created</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGPTs.map((gpt) => (
                <div
                  key={gpt.id}
                  className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => onSelectGPT(gpt)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {gpt.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{gpt.name}</h3>
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{gpt.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>By {gpt.author}</span>
                          {gpt.rating && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{gpt.rating}</span>
                            </div>
                          )}
                          {gpt.usage_count && <span>{gpt.usage_count.toLocaleString()} users</span>}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectGPT(gpt);
                            }}
                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"
                          >
                            Edit
                          </button>
                          <button className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
                            Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Trending</h2>
            <p className="text-gray-600">Most popular GPTs by our community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredGPTs.slice(0, 3).map((gpt) => (
              <div
                key={`trending-${gpt.id}`}
                className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onChatWithGPT ? onChatWithGPT(gpt as any) : onSelectGPT(gpt as any)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${gpt.color} rounded-full flex items-center justify-center text-white text-xl`}>
                    {gpt.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{gpt.name}</h3>
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{gpt.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>By {gpt.author}</span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{gpt.rating}</span>
                        </div>
                        <span>{gpt.usage_count?.toLocaleString()} users</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectGPT(gpt as any);
                          }}
                          className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg"
                        >
                          Edit
                        </button>
                        <button className="px-3 py-1 text-xs bg-blue-600 text-white hover:bg-blue-700 rounded-lg">
                          Chat
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}