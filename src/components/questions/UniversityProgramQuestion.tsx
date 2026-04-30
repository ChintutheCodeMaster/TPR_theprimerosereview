
import React, { useState } from 'react';
import { TextQuestionInput } from "./TextQuestion";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface UniversityProgramQuestionProps {
  question: {
    subQuestions: any[];
  };
  value: {
    university?: string;
    program?: string;
  };
  onChange: (value: any) => void;
}

export const UniversityProgramQuestion: React.FC<UniversityProgramQuestionProps> = ({
  question,
  value,
  onChange
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const universityQuestion = question.subQuestions.find(q => q.id === 'university');
  const programQuestion = question.subQuestions.find(q => q.id === 'program');

  const universities: string[] = universityQuestion?.options ?? [];
  const filtered = search.trim()
    ? universities.filter(u => u.toLowerCase().includes(search.toLowerCase()))
    : universities;

  const handleUniversitySelect = (university: string) => {
    onChange({ ...value, university });
    setOpen(false);
    setSearch('');
  };

  const handleProgramChange = (program: string) => {
    onChange({ ...value, program });
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">{universityQuestion?.question}</h3>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full h-12 justify-between text-base font-normal"
            >
              <span className={cn(!value?.university && "text-muted-foreground")}>
                {value?.university || "Select a university"}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <input
                className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Search universities..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-72 overflow-y-auto">
              {filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No university found.</p>
              ) : (
                filtered.map(university => (
                  <button
                    key={university}
                    onClick={() => handleUniversitySelect(university)}
                    className="relative flex w-full cursor-pointer select-none items-center px-4 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground text-left"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 shrink-0",
                        value?.university === university ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {university}
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">{programQuestion?.question}</h3>
        <TextQuestionInput
          question={programQuestion}
          value={value?.program || ''}
          onChange={handleProgramChange}
        />
      </div>
    </div>
  );
};
