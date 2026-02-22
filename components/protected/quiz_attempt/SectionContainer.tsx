import { SectionSeed } from "@/data/quizQuestions";

type Props = {
  sections: SectionSeed[];
  curSectionId: number;
  setCurSectionId: (id: number) => void;
};

export default function SectionContainer({
  sections,
  curSectionId,
  setCurSectionId,
}: Props) {
  return (
    <div className="h-16 flex gap-2 p-2">
      {sections.map((section) => (
        <button
          key={section.section_id}
          onClick={() => setCurSectionId(section.section_id)}
          className={`px-4 py-2 rounded-lg hover:cursor-pointer
            ${
              curSectionId === section.section_id
                ? "bg-amber-500 text-black"
                : "bg-neutral-900"
            }`}
        >
          {section.title}
        </button>
      ))}
    </div>
  );
}
