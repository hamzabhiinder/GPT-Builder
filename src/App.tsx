import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Upload, Plus, Check, Info, Settings, Key, Download, Upload as UploadIcon } from 'lucide-react';
import { GPTConfig, SavedGPT } from './types/gpt';
import { gptService } from './services/gptService';
import { knowledgeService } from './services/knowledgeService';
import ShareModal from './components/ShareModal';
import GPTStore from './components/GPTStore';
import ApiKeyModal from './components/ApiKeyModal';
import ChatInterface from './components/ChatInterface';

function App() {
  const [currentView, setCurrentView] = useState<'builder' | 'store' | 'chat'>('builder');
  const [activeTab, setActiveTab] = useState<'create' | 'configure' | 'preview'>('configure');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [savedGPTs, setSavedGPTs] = useState<SavedGPT[]>([]);
  const [currentGPT, setCurrentGPT] = useState<GPTConfig | null>(null);
  const [chatGPT, setChatGPT] = useState<SavedGPT | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [gptConfig, setGptConfig] = useState<GPTConfig>({
    name: 'EduEnroll Assistant',
    description: 'A chatbot to help prospective students explore and enroll in online courses.',
    instructions: 'act as a friendly and informative course assistant that guides users in choosing the right course based on their interests, goals, and skill level, while also answering questions about enrollment, pricing, and certification.',
    conversation_starters: [
      'Hi there! Not sure where to start? I can guide you through course categories based on your goals.',
      ''
    ],
    knowledge_files: [],
    capabilities: {
      web_search: true,
      canvas: true,
      dalle_image_generation: true,
      code_interpreter: false,
    },
    custom_actions: [],
    visibility: 'private'
  });

  const [newStarter, setNewStarter] = useState('');
  const [showNewStarterInput, setShowNewStarterInput] = useState(false);

  useEffect(() => {
    // Load saved GPTs on component mount
    const saved = gptService.getSavedGPTs();
    setSavedGPTs(saved);

    // Check if API key exists
    const apiKey = gptService.getApiKey();
    if (!apiKey) {
      setShowApiKeyModal(true);
    }
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddStarter = () => {
    if (newStarter.trim()) {
      setGptConfig(prev => ({
        ...prev,
        conversation_starters: [...prev.conversation_starters.filter(s => s), newStarter.trim()]
      }));
      setNewStarter('');
      setShowNewStarterInput(false);
    }
  };

  const handleRemoveStarter = (index: number) => {
    setGptConfig(prev => ({
      ...prev,
      conversation_starters: prev.conversation_starters.filter((_, i) => i !== index)
    }));
  };

  const handleCapabilityChange = (capability: keyof GPTConfig['capabilities']) => {
    setGptConfig(prev => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [capability]: !prev.capabilities[capability]
      }
    }));
  };

  const handleSaveGPT = async (visibility: 'private' | 'link' | 'public') => {
    setIsLoading(true);
    try {
      const configToSave = { ...gptConfig, visibility };
      const savedGPT = await gptService.saveGPT(configToSave);
      
      // Update saved GPTs list
      const updatedGPTs = gptService.getSavedGPTs();
      setSavedGPTs(updatedGPTs);
      
      setCurrentGPT(savedGPT);
      
      let message = 'GPT saved successfully!';
      if (visibility === 'link') {
        const shareLink = gptService.generateShareableLink(savedGPT.id);
        message += ` Share link: ${shareLink}`;
      } else if (visibility === 'public') {
        message += ' Published to GPT Store!';
      }
      
      showNotification(message, 'success');
    } catch (error) {
      showNotification('Error saving GPT', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGPT = (gpt: SavedGPT) => {
    setGptConfig(gpt);
    setCurrentGPT(gpt);
    setCurrentView('builder');
    setActiveTab('configure');
  };

  const handleChatWithGPT = (gpt: SavedGPT) => {
    setChatGPT(gpt);
    setCurrentView('chat');
  };

  const handleCreateNewGPT = () => {
    // Reset to default config for new GPT
    setGptConfig({
      name: 'My Custom GPT',
      description: 'A helpful AI assistant',
      instructions: 'You are a helpful AI assistant. Be friendly, informative, and assist users with their questions.',
      conversation_starters: [
        'Hello! How can I help you today?',
        'What would you like to know?'
      ],
      knowledge_files: [],
      capabilities: {
        web_search: true,
        canvas: false,
        dalle_image_generation: false,
        code_interpreter: false,
      },
      custom_actions: [],
      visibility: 'private'
    });
    setCurrentGPT(null);
    setCurrentView('builder');
    setActiveTab('configure');
  };

  const handleExportGPT = () => {
    if (currentGPT) {
      gptService.exportGPT(currentGPT);
      showNotification('GPT exported successfully!', 'success');
    }
  };

  const handleImportGPT = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const importedGPT = await gptService.importGPT(file);
      setGptConfig(importedGPT);
      setCurrentGPT(importedGPT);
      showNotification('GPT imported successfully!', 'success');
    } catch (error) {
      showNotification('Error importing GPT', 'error');
    }
  };

  const handleApiKeySave = (apiKey: string) => {
    gptService.setApiKey(apiKey);
    showNotification('API key saved successfully!', 'success');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Validate files before processing
    for (let i = 0; i < files.length; i++) {
      const validation = knowledgeService.validateFile(files[i]);
      if (!validation.valid) {
        showNotification(validation.error || 'Invalid file', 'error');
        return;
      }
    }

    setIsLoading(true);
    try {
      const processedFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const knowledgeFile = await knowledgeService.processFile(file);
        processedFiles.push(knowledgeFile);
      }

      setGptConfig(prev => ({
        ...prev,
        knowledge_files: [...prev.knowledge_files, ...processedFiles]
      }));

      showNotification(`${processedFiles.length} file(s) uploaded successfully!`, 'success');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Error uploading files', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveKnowledgeFile = (fileId: string) => {
    setGptConfig(prev => ({
      ...prev,
      knowledge_files: prev.knowledge_files.filter(file => file.id !== fileId)
    }));
  };

  // Chat Interface
  if (currentView === 'chat' && chatGPT) {
    return (
      <ChatInterface 
        gpt={chatGPT} 
        onBack={() => setCurrentView('store')} 
      />
    );
  }

  if (currentView === 'store') {
    return (
      <div className="min-h-screen bg-white">
        {/* Store Header */}
        <div className="border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setCurrentView('builder')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="font-semibold text-gray-900">GPT Store</h1>
            </div>
            <button 
              onClick={handleCreateNewGPT}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              Create New GPT
            </button>
          </div>
        </div>
        <GPTStore 
          savedGPTs={savedGPTs}
          onSelectGPT={handleSelectGPT}
          onChatWithGPT={handleChatWithGPT}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setCurrentView('store')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {gptConfig.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">{gptConfig.name}</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{currentGPT ? 'Saved' : 'Draft'}</span>
                  <span>•</span>
                  <span>Only me</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="API Settings"
            >
              <Key className="w-4 h-4 text-gray-600" />
            </button>
            {currentGPT && (
              <>
                <button
                  onClick={handleExportGPT}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Export GPT"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
                <label className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer" title="Import GPT">
                  <UploadIcon className="w-4 h-4 text-gray-600" />
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportGPT}
                    className="hidden"
                  />
                </label>
              </>
            )}
            <button 
              onClick={() => setShowShareModal(true)}
              className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Create'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-4">
            {['Create', 'Configure', 'Preview'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase() as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.toLowerCase()
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Configure Tab Content */}
        {activeTab === 'configure' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
            {/* Left Column - Configuration */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {gptConfig.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={gptConfig.name}
                      onChange={(e) => setGptConfig(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={gptConfig.description}
                      onChange={(e) => setGptConfig(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructions</label>
                    <textarea
                      value={gptConfig.instructions}
                      onChange={(e) => setGptConfig(prev => ({ ...prev, instructions: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Conversation Starters */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Conversation starters</h3>
                <div className="space-y-3">
                  {gptConfig.conversation_starters.filter(s => s).map((starter, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <span className="flex-1 text-gray-700">{starter}</span>
                      <button
                        onClick={() => handleRemoveStarter(index)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ))}
                  
                  {showNewStarterInput ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={newStarter}
                        onChange={(e) => setNewStarter(e.target.value)}
                        placeholder="Add a conversation starter..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddStarter()}
                        autoFocus
                      />
                      <button
                        onClick={handleAddStarter}
                        className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => {
                          setShowNewStarterInput(false);
                          setNewStarter('');
                        }}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewStarterInput(true)}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add conversation starter</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Knowledge */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Knowledge</h3>
                <p className="text-sm text-gray-600">
                  If you upload files under Knowledge, conversations with your GPT may include file contents. Files can be downloaded when Code Interpreter is enabled
                </p>
                
                {/* Uploaded Files */}
                {gptConfig.knowledge_files.length > 0 && (
                  <div className="space-y-2">
                    {gptConfig.knowledge_files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-medium">
                              {file.name.split('.').pop()?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                            <div className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(1)} KB • {knowledgeService.getFileSummary(file)} • {new Date(file.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveKnowledgeFile(file.id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Upload files</span>
                  <input
                    type="file"
                    multiple
                    accept=".txt,.pdf,.doc,.docx,.json,.csv,.md,text/plain,application/pdf,application/json,text/csv,text/markdown"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
                
                <div className="text-xs text-gray-500 mt-2">
                  Supported formats: TXT, PDF, DOC, DOCX, JSON, CSV, MD (max 10MB each)
                </div>
              </div>

              {/* Capabilities */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Capabilities</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={gptConfig.capabilities.web_search}
                        onChange={() => handleCapabilityChange('web_search')}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        gptConfig.capabilities.web_search 
                          ? 'bg-black border-black' 
                          : 'border-gray-300'
                      }`}>
                        {gptConfig.capabilities.web_search && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                    <span className="text-gray-900">Web Search</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={gptConfig.capabilities.canvas}
                        onChange={() => handleCapabilityChange('canvas')}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        gptConfig.capabilities.canvas 
                          ? 'bg-black border-black' 
                          : 'border-gray-300'
                      }`}>
                        {gptConfig.capabilities.canvas && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                    <span className="text-gray-900">Canvas</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={gptConfig.capabilities.dalle_image_generation}
                        onChange={() => handleCapabilityChange('dalle_image_generation')}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        gptConfig.capabilities.dalle_image_generation 
                          ? 'bg-black border-black' 
                          : 'border-gray-300'
                      }`}>
                        {gptConfig.capabilities.dalle_image_generation && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                    <span className="text-gray-900">DALL-E Image Generation</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={gptConfig.capabilities.code_interpreter}
                        onChange={() => handleCapabilityChange('code_interpreter')}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        gptConfig.capabilities.code_interpreter 
                          ? 'bg-black border-black' 
                          : 'border-gray-300'
                      }`}>
                        {gptConfig.capabilities.code_interpreter && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-900">Code Interpreter & Data Analysis</span>
                      <Info className="w-4 h-4 text-gray-400" />
                    </div>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Actions</h3>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Create new action
                </button>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-white text-xl font-bold">
                        {gptConfig.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg">{gptConfig.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 text-center leading-relaxed">
                      {gptConfig.description}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div className="text-sm text-gray-600">
                      {gptConfig.conversation_starters.filter(s => s)[0] || "Hi there! How can I help you today?"}
                    </div>
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        placeholder="Ask anything"
                        className="flex-1 text-sm text-gray-500 bg-transparent border-none focus:outline-none"
                        disabled
                      />
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-400 text-xs">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div className="p-6">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your GPT</h2>
              <p className="text-gray-600 mb-8">Start by describing what you want your GPT to do</p>
              <textarea
                placeholder="Describe your GPT idea here..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button className="mt-4 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800">
                Generate Configuration
              </button>
            </div>
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-50 rounded-lg p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">
                      {gptConfig.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{gptConfig.name}</h2>
                  <p className="text-gray-600 mt-2">{gptConfig.description}</p>
                </div>

                <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
                  <div className="space-y-4">
                    <div className="text-gray-700">
                      {gptConfig.conversation_starters.filter(s => s)[0] || "Hi there! How can I help you today?"}
                    </div>
                    <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                      <input
                        type="text"
                        placeholder="Ask anything"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center hover:bg-gray-800">
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        gptConfig={gptConfig}
        onSave={handleSaveGPT}
      />

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleApiKeySave}
        currentApiKey={gptService.getApiKey() || ''}
      />
    </div>
  );
}

export default App;