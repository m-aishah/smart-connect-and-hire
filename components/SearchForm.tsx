'use client';

import { useState, useEffect, useRef } from "react";
import Form from "next/form";
import { Search, MessageSquare, X, Mic, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";

const placeholders = [
  "Need a math tutor for high school exams",
  "Looking for someone to build my website",
  "Can I find a babysitter near me?",
  "Help with moving furniture this weekend",
  "Need urgent AC repair today",
  "Looking for a personal trainer for mornings",
  "Anyone available for dog walking in the evening?",
  "Search for Arabic-English translation services",
  "Want to learn guitar from scratch",
  "Looking for deep cleaning services in Nicosia"
];

// Component for typing animation effect
const TypingPlaceholder = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    // Reset when text changes
    setDisplayText("");
    setCurrentIndex(0);
  }, [text]);
  
  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(currentIndex + 1);
      }, 50); // Speed of typing
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);
  
  return <>{displayText}</>
};

// Animated particles component
const ParticleEffect = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-amber-300/40"
          initial={{ 
            x: `${Math.random() * 100}%`, 
            y: `${Math.random() * 100}%`, 
            opacity: 0.1,
            scale: 0.2
          }}
          animate={{ 
            x: `${Math.random() * 100}%`, 
            y: `${Math.random() * 100}%`,
            opacity: [0.1, 0.6, 0.1],
            scale: [0.2, 0.8, 0.2]
          }}
          transition={{ 
            duration: 5 + Math.random() * 10,
            repeat: Infinity,
            repeatType: 'loop',
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

// Animated AI processing icon
const AIProcessingIcon = () => {
  return (
    <div className="relative w-6 h-6">
      <motion.div
        className="absolute inset-0 text-amber-500"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 3, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity, repeatType: "reverse" }
        }}
      >
        <Sparkles size={24} />
      </motion.div>
      
      {/* Orbiting particles */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-400 rounded-full"
          initial={{ scale: 0.5 }}
          animate={{
            rotate: 360,
            scale: [0.5, 1, 0.5],
            opacity: [0.3, 0.7, 0.3]
          }}
          style={{
            left: '50%',
            top: '50%',
            transformOrigin: '0 0',
            transform: `rotate(${i * 120}deg) translate(10px, 0)`,
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.3 },
            scale: { duration: 1, repeat: Infinity, repeatType: "reverse", delay: i * 0.2 },
            opacity: { duration: 1, repeat: Infinity, repeatType: "reverse", delay: i * 0.2 }
          }}
        />
      ))}
    </div>
  );
};

// Enhanced waveform visualization for processing state
const WaveformVisualizer = () => {
  return (
    <div className="flex items-center justify-center space-x-1 h-5">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="w-0.5 bg-gradient-to-t from-purple-600 to-amber-400 rounded-full"
          animate={{
            height: [5, 15, 5],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.7,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.1,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

const SearchForm = ({ query }: { query?: string }) => {
  const [inputValue, setInputValue] = useState(query || "");
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [placeholder, setPlaceholder] = useState(placeholders[0]);
  const [showTyping, setShowTyping] = useState(true);
  const [ringEffect, setRingEffect] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState("auto");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update placeholder periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setShowTyping(true);
      setPlaceholder(placeholders[Math.floor(Math.random() * placeholders.length)]);
      
      // Hide typing effect after it's done
      const typingDuration = placeholders[0].length * 50 + 500;
      setTimeout(() => {
        setShowTyping(false);
      }, typingDuration);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update input value when query prop changes
  useEffect(() => {
    setInputValue(query || "");
  }, [query]);

  // Auto-adjust textarea height
  useEffect(() => {
    if (inputRef.current) {
      // Reset height to auto to properly calculate new height
      inputRef.current.style.height = "auto";
      // Set the new height based on scrollHeight with min/max constraints
      const newHeight = Math.max(60, Math.min(inputRef.current.scrollHeight, isMobile ? 80 : 120));
      inputRef.current.style.height = `${newHeight}px`;
      setTextareaHeight(`${newHeight}px`);
    }
  }, [inputValue, isMobile]);

  // Handle form submission with smart detection
  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    setIsSearching(true);
    setSearchFeedback(null);
    setRingEffect(true);
    
    try {
      // First try conversational search
      const response = await fetch('/api/chat/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputValue }),
      });
      
      const data = await response.json();
      
      if (response.ok && (data.urlParams || data.searchQuery)) {
        // Conversational search worked
        if (data.urlParams) {
          router.push(`/?${data.urlParams}`);
        } else if (data.searchQuery) {
          router.push(`/?query=${encodeURIComponent(data.searchQuery)}`);
        }
      } else {
        // Fall back to traditional search
        router.push(`/?query=${encodeURIComponent(inputValue)}`);
      }
    } catch (error) {
      console.error('Error processing search:', error);
      // Fall back to traditional search on error
      router.push(`/?query=${encodeURIComponent(inputValue)}`);
    } finally {
      // Delay turning off isSearching for better UX
      setTimeout(() => {
        setIsSearching(false);
        setRingEffect(false);
      }, 300);
    }
  };

  // Clear search input
  const clearSearch = () => {
    setInputValue("");
    router.push('/');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle microphone click (placeholder for voice search)
  const handleMicClick = () => {
    // This is just a placeholder - will be implemented later
    setRingEffect(true);
    setTimeout(() => setRingEffect(false), 1000);
  };

  // Focus the input when component mounts
  useEffect(() => {
    if (inputRef.current && !query) {
      inputRef.current.focus();
    }
  }, [query]);

  // Handle textarea input and prevent default Enter behavior
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSmartSearch(e);
    }
  };

  return (
    <div className="w-full py-4 sm:py-6 px-3 sm:px-0">
      <Form 
        action="/"
        onSubmit={handleSmartSearch} 
        className="relative mx-auto w-full max-w-4xl" // Increased max width
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ 
            scale: 1, 
            opacity: 1, 
            y: [0, -5, 0], // Subtle floating animation
          }}
          transition={{ 
            duration: 0.5,
            y: {
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }
          }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className={`relative rounded-2xl overflow-hidden shadow-xl 
            ${ringEffect ? 'ring-2 ring-amber-300/50' : ''} 
            transition-all duration-300`}
          style={{
            boxShadow: isHovered 
              ? '0 25px 50px -12px rgba(124, 58, 237, 0.35), 0 8px 24px -8px rgba(245, 158, 11, 0.2)' 
              : '0 20px 25px -5px rgba(124, 58, 237, 0.25), 0 8px 10px -6px rgba(245, 158, 11, 0.1)'
          }}
        >
          {/* Advanced glowing effect */}
          <motion.div 
            animate={{ 
              background: [
                'radial-gradient(circle at 30% 50%, rgba(124, 58, 237, 0.3), rgba(79, 70, 229, 0) 70%)',
                'radial-gradient(circle at 70% 50%, rgba(245, 158, 11, 0.25), rgba(79, 70, 229, 0) 70%)',
                'radial-gradient(circle at 30% 50%, rgba(124, 58, 237, 0.3), rgba(79, 70, 229, 0) 70%)'
              ],
              opacity: [0.6, 0.9, 0.6]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }}
            className="absolute inset-0 rounded-2xl blur-lg"
          />
          
          {/* Ambient pulsing glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.05, 1],
              opacity: [0.6, 0.8, 0.6] 
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
            className={`absolute inset-0 bg-gradient-to-r from-indigo-500/15 via-amber-400/15 to-purple-500/15 rounded-2xl blur-xl`}
          />
          
          {/* Moving highlight */}
          <motion.div 
            animate={{ 
              x: ['0%', '100%', '0%'],
              opacity: [0, 0.3, 0]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-amber-300/20 to-transparent pointer-events-none"
          />
          
          {/* Particle effects */}
          <ParticleEffect />
          
          <div className="relative flex flex-col sm:flex-row items-center w-full bg-white/95 backdrop-blur-sm rounded-2xl">
            <div className="w-full flex items-center">
              {/* Microphone Icon with animation */}
              <motion.button
                whileHover={{ scale: 1.15, color: "#9333EA" }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={handleMicClick}
                className="ml-4 sm:ml-5 text-gray-400 hover:text-purple-600 focus:outline-none transition-colors"
                aria-label="Voice search"
              >
                <Mic size={20} />
              </motion.button>
              
              <div className="flex-grow flex items-center px-3 sm:px-4 relative">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={isSearching ? 'searching' : 'input'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex items-center"
                  >
                    {isSearching ? (
                      <div className="py-4 sm:py-5 px-2 flex items-center justify-start space-x-3 text-purple-600">
                        <WaveformVisualizer />
                        <span className="text-xs sm:text-sm font-medium bg-gradient-to-r from-purple-600 via-amber-500 to-indigo-600 bg-clip-text text-transparent">
                          Processing...
                        </span>
                      </div>
                    ) : (
                      <textarea
                        ref={inputRef}
                        name="query"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleTextareaKeyDown}
                        className="w-full flex items-center py-4 sm:py-5 text-gray-700 outline-none placeholder:text-gray-400 text-sm sm:text-base bg-transparent resize-none overflow-hidden"
                        placeholder={showTyping ? "" : placeholder}
                        aria-label="Smart Search"
                        autoComplete="off"
                        onFocus={() => setRingEffect(true)}
                        onBlur={() => !inputValue && setRingEffect(false)}
                        style={{ 
                          height: textareaHeight,
                          minHeight: "60px",
                          maxHeight: isMobile ? "80px" : "120px",
                          display: "flex",
                          alignItems: "center"
                        }}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
                
                {/* Typing placeholder effect - positioned absolutely with the same dimensions as textarea */}
                {!inputValue && !isSearching && showTyping && (
                  <div 
                    ref={placeholderRef}
                    className="absolute left-0 ml-12 text-gray-400 pointer-events-none flex items-center h-full"
                    style={{
                      maxWidth: 'calc(100% - 80px)'
                    }}
                  >
                    <TypingPlaceholder text={placeholder} />
                  </div>
                )}
                
                {inputValue && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
                    whileTap={{ scale: 0.8 }}
                    type="button"
                    onClick={clearSearch}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none mx-1 flex-shrink-0 absolute right-0 top-1/2 transform -translate-y-1/2"
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </motion.button>
                )}
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 sm:pr-4 w-full sm:w-auto flex justify-center sm:justify-end mt-2 sm:mt-0"
            >
              <Button 
                type="submit" 
                className="h-10 sm:h-12 w-full sm:w-auto px-4 sm:px-5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 hover:via-amber-600 hover:to-indigo-700 transition-all shadow-lg" 
                aria-label="Search"
                disabled={isSearching}
                style={{
                  boxShadow: isHovered 
                    ? '0 10px 15px -3px rgba(124, 58, 237, 0.5), 0 4px 6px -4px rgba(245, 158, 11, 0.3)'
                    : '0 4px 6px -1px rgba(124, 58, 237, 0.3), 0 2px 4px -2px rgba(245, 158, 11, 0.2)'
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={isSearching ? 'spinner' : 'search'}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center"
                  >
                    {isSearching ? (
                      <motion.div 
                        animate={{ 
                          rotate: 360,
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                          rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
                          scale: { duration: 0.8, repeat: Infinity, repeatType: "reverse" }
                        }}
                      >
                        <Sparkles size={20} className="text-white" />
                      </motion.div>
                    ) : (
                      <>
                        <Search size={18} className="mr-2" />
                        <span className="font-medium">Search</span>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </Form>
      
      {searchFeedback && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm max-w-lg mx-auto shadow-md"
        >
          {searchFeedback}
        </motion.div>
      )}
    </div>
  );
};

export default SearchForm;