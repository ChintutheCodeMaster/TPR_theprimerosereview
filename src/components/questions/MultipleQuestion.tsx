
import React from 'react';
import { MultipleQuestion } from '@/types/onboarding';
import { Heart, Wrench, Sparkles, Shuffle, Brain } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface MultipleQuestionProps {
  question: MultipleQuestion;
  value: any;
  onChange: (value: any) => void;
  hasInteracted: boolean;
  setHasInteracted: (value: boolean) => void;
}

const getIconForOption = (option: string) => {
  const iconProps = { className: "w-6 h-6" };
  switch (option) {
    case "Determination":
      return (
        <img 
          src="/lovable-uploads/2649d943-9459-46c2-8565-0fb88cd0fcd5.png" 
          alt="Elastigirl representing determination" 
          className="w-24 h-24 object-cover rounded-full transition-all duration-300"
        />
      );
    case "Leadership":
      return (
        <img 
          src="/lovable-uploads/bc0d81d5-2d21-4174-a71e-f9ef5d67da08.png" 
          alt="Wonder Woman representing leadership" 
          className="w-24 h-24 object-cover rounded-full transition-all duration-300"
        />
      );
    case "Problem-solving":
      return (
        <img 
          src="/lovable-uploads/1b22d76b-953c-4ee4-b343-6296bd06da68.png" 
          alt="Captain America representing problem-solving" 
          className="w-24 h-24 object-cover rounded-full transition-all duration-300"
        />
      );
    case "Curiosity":
      return (
        <img 
          src="/lovable-uploads/7f7d5fe0-38b4-42f1-b755-c4a9e74534ec.png" 
          alt="Spider-Man representing curiosity" 
          className="w-24 h-24 object-cover rounded-full transition-all duration-300"
        />
      );
    case "Strategic vision":
      return (
        <img 
          src="/lovable-uploads/ccd4f968-85b0-4ca0-a025-f1b0a78f1fec.png" 
          alt="Doctor Strange representing strategic vision" 
          className="w-24 h-24 object-cover rounded-full transition-all duration-300"
        />
      );
    case "Creativity":
      return (
        <img 
          src="/lovable-uploads/a815035b-72de-47be-846f-e770e6ff78d5.png" 
          alt="Jack Sparrow representing creativity" 
          className="w-24 h-24 object-cover rounded-full transition-all duration-300"
        />
      );
    case "Teamwork":
      return (
        <img 
          src="/lovable-uploads/f0334999-0b0e-4771-960f-354594e34cbb.png" 
          alt="A friendly green character representing teamwork" 
          className="w-24 h-24 object-cover rounded-full transition-all duration-300"
        />
      );
    case "Communication":
      return (
        <img 
          src="/lovable-uploads/b524ce3b-6ce8-498f-a830-d1261f00c3fe.png" 
          alt="Joy representing communication" 
          className="w-24 h-24 object-cover rounded-full transition-all duration-300"
        />
      );
    case "Empathy":
      return (
        <img 
          src="/lovable-uploads/3a7db52b-1439-42e1-bd68-e863b8178096.png" 
          alt="Woody representing empathy" 
          className="w-24 h-24 object-cover rounded-full transition-all duration-300"
        />
      );
    case "Innovation":
      return (
        <img 
          src="/lovable-uploads/e097295f-db60-4395-b2de-ed3a1a5178ea.png" 
          alt="Iron Man representing innovation" 
          className="w-24 h-24 object-cover rounded-full transition-all duration-300"
        />
      );
    case "Adaptability":
      return (
        <img 
          src="/lovable-uploads/31e4ddf4-871c-4a6c-a20f-25a47a324239.png" 
          alt="Elsa representing adaptability" 
          className="w-24 h-24 object-cover rounded-full transition-all duration-300"
        />
      );
    case "Critical thinking":
      return (
        <img 
          src="/lovable-uploads/a8a61315-0810-4cf7-92eb-a91081335c4a.png" 
          alt="Sherlock Holmes representing critical thinking" 
          className="w-24 h-24 object-cover rounded-full transition-all duration-300"
        />
      );
    default:
      return <Sparkles {...iconProps} />;
  }
};

const getDescriptionForOption = (option: string) => {
  const descriptions: Record<string, string> = {
    "Determination": "You never give up, no matter the challenge",
    "Creativity": "You think outside the box and bring fresh ideas",
    "Leadership": "You inspire and guide those around you",
    "Curiosity": "You're always learning and asking big questions",
    "Empathy": "You understand and connect with others deeply",
    "Problem-solving": "You find solutions where others see obstacles",
    "Innovation": "You pioneer new approaches and ideas",
    "Adaptability": "You thrive in changing environments",
    "Critical thinking": "You analyze situations with deep insight",
    "Communication": "You express ideas clearly and effectively",
    "Strategic vision": "You see the bigger picture and plan ahead",
    "Teamwork": "You collaborate and bring people together"
  };
  return descriptions[option] || "";
};

export const MultipleQuestionInput: React.FC<MultipleQuestionProps> = ({
  question,
  value = { selected: [], elaboration: '' },
  onChange,
  hasInteracted,
  setHasInteracted
}) => {
  const handleOptionClick = (option: string) => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }

    const currentAnswers = value.selected || [];
    if (currentAnswers.includes(option)) {
      onChange({
        ...value,
        selected: currentAnswers.filter((a: string) => a !== option)
      });
    } else {
      if (currentAnswers.length < question.maxChoices) {
        onChange({
          ...value,
          selected: [...currentAnswers, option]
        });
      }
    }
  };

  const handleElaborationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange({
      ...value,
      elaboration: e.target.value
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {question.options.map((option) => {
          const isSelected = (value.selected || []).includes(option);
          const icon = getIconForOption(option);
          const description = getDescriptionForOption(option);
          const isImageOption = option === "Determination" || option === "Leadership" || 
                              option === "Problem-solving" || option === "Curiosity" || 
                              option === "Strategic vision" || option === "Creativity" ||
                              option === "Teamwork" || option === "Communication" || 
                              option === "Empathy" || option === "Innovation" || 
                              option === "Adaptability" || option === "Critical thinking";
          
          return (
            <button
              key={option}
              onClick={() => handleOptionClick(option)}
              className={`
                group p-4 rounded-lg border transition-all duration-300
                ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-neutral-200 hover:border-primary/50'}
                cursor-pointer text-center space-y-4
              `}
            >
              <div className={`
                inline-flex items-center justify-center
                ${isImageOption
                  ? isSelected 
                    ? 'ring-4 ring-primary ring-offset-4 rounded-full scale-105'
                    : 'hover:scale-105 transition-transform duration-300'
                  : 'p-3 rounded-full bg-neutral-100 group-hover:bg-neutral-200'
                }
                transition-all duration-300
              `}>
                {icon}
              </div>
              <div>
                <h3 className="font-medium mb-2">{option}</h3>
                <p className="text-sm text-neutral-600">
                  {description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
      
      {question.followUp && value.selected?.length > 0 && (
        <div className="animate-fade-in">
          <Textarea
            placeholder={question.followUp.placeholder}
            maxLength={question.followUp.maxLength}
            value={value.elaboration || ''}
            onChange={handleElaborationChange}
            className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300"
          />
          <p className="text-sm text-neutral-500 mt-2">
            {value.elaboration?.length || 0}/{question.followUp.maxLength} characters
          </p>
        </div>
      )}
    </div>
  );
};
