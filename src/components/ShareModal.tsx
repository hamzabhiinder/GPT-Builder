import React, { useState } from 'react';
import { X, Users, Link, Globe, Check } from 'lucide-react';
import { GPTConfig } from '../types/gpt';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  gptConfig: GPTConfig;
  onSave: (visibility: 'private' | 'link' | 'public') => void;
}

export default function ShareModal({ isOpen, onClose, gptConfig, onSave }: ShareModalProps) {
  const [selectedVisibility, setSelectedVisibility] = useState<'private' | 'link' | 'public'>('link');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(selectedVisibility);
      onClose();
    } catch (error) {
      console.error('Error saving GPT:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Share GPT</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Only me</div>
                  <div className="text-sm text-gray-500">Private to you</div>
                </div>
              </div>
              <input
                type="radio"
                name="visibility"
                value="private"
                checked={selectedVisibility === 'private'}
                onChange={(e) => setSelectedVisibility(e.target.value as any)}
                className="ml-auto"
              />
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <Link className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">Anyone with the link</div>
                  <div className="text-sm text-gray-500">Shareable link</div>
                </div>
              </div>
              <div className="ml-auto flex items-center">
                {selectedVisibility === 'link' && (
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                )}
                <input
                  type="radio"
                  name="visibility"
                  value="link"
                  checked={selectedVisibility === 'link'}
                  onChange={(e) => setSelectedVisibility(e.target.value as any)}
                />
              </div>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">GPT Store</div>
                  <div className="text-sm text-gray-500">Public in GPT Store</div>
                </div>
              </div>
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={selectedVisibility === 'public'}
                onChange={(e) => setSelectedVisibility(e.target.value as any)}
                className="ml-auto"
              />
            </label>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {gptConfig.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">{gptConfig.name}</div>
                <div className="text-sm text-gray-500">By You</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}