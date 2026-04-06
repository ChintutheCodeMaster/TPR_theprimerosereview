
import { Step } from "../../types/onboarding";

export const backgroundStep: Step = {
  title: "Specific Information",
  description: "Tell us about your university and program selection.",
  questions: [
    {
      id: "university_program_info",
      question: "Which university and program are you applying to?",
      type: "combined_cards",
      subQuestions: [
        {
          id: "university",
          question: "Which university?",
          type: "select",
          options: [
            "Harvard University", "Stanford University", "MIT", "Yale University",
            "Princeton University", "Columbia University", "University of Chicago",
            "University of Pennsylvania", "Duke University", "Johns Hopkins University",
            "Northwestern University", "Dartmouth College", "Brown University",
            "Vanderbilt University", "Rice University", "Washington University in St. Louis",
            "Cornell University", "University of Notre Dame", "UCLA", "Emory University",
            "UC Berkeley", "Georgetown University", "Carnegie Mellon University",
            "University of Southern California", "University of Virginia", "Tufts University",
            "Wake Forest University", "University of Michigan", "Boston College",
            "New York University", "University of Rochester", "Brandeis University",
            "Case Western Reserve University", "Boston University", "Tulane University",
            "University of Georgia", "University of Wisconsin-Madison", "Villanova University",
            "University of Illinois Urbana-Champaign", "Lehigh University",
            "Northeastern University", "University of Miami", "Ohio State University",
            "Penn State University", "University of Texas at Austin", "Pepperdine University",
            "University of Washington", "Florida State University", "Syracuse University",
            "University of Pittsburgh", "University of Florida", "Purdue University",
            "University of Maryland", "Texas A&M University", "Virginia Tech",
            "Indiana University", "University of Connecticut", "University of Delaware",
            "University of Vermont", "American University", "Auburn University",
            "Clemson University", "University of Alabama", "University of South Carolina",
            "University of Tennessee", "University of Kentucky", "University of Arkansas",
            "Louisiana State University", "University of Mississippi", "Mississippi State University",
            "University of Oklahoma", "Oklahoma State University", "University of Kansas",
            "Kansas State University", "University of Missouri", "University of Iowa",
            "Iowa State University", "University of Nebraska", "University of Colorado Boulder",
            "Colorado State University", "University of Utah", "Utah State University",
            "University of Nevada, Las Vegas", "University of New Mexico", "Arizona State University",
            "University of Arizona", "University of California, San Diego",
            "University of California, Irvine", "University of California, Davis",
            "University of California, Santa Barbara", "University of California, Riverside",
            "University of California, Santa Cruz", "California Institute of Technology",
            "University of Oregon", "Oregon State University", "University of Idaho",
            "Washington State University", "University of Montana", "Montana State University",
            "University of Wyoming", "University of North Dakota", "North Dakota State University",
            "University of South Dakota", "South Dakota State University", "University of Minnesota",
            "University of Alaska", "University of Hawaii", "Other"
          ]
        },
        {
          id: "program",
          question: "Which program?",
          type: "text",
          placeholder: "Enter the program name",
          maxLength: 200
        }
      ]
    }
  ]
};
