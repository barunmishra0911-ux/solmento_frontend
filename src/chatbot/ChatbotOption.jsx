import { ChevronRight } from "lucide-react";

export default function ChatbotOption({
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        flex
        w-full
        cursor-pointer
        items-center
        gap-4
        rounded-xl
        bg-white
        p-4
        text-left
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
      "
    >
      {/* ICON */}

      <div
        className="
          flex
          h-14
          w-14
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-blue-400
          text-white
          hover:bg-blue-500
        "
      >
        <Icon className="h-7 w-7" />
      </div>

      {/* CONTENT */}

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>

        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>

      {/* ARROW */}

      <ChevronRight
        className="
          h-5
          w-5
          shrink-0
          text-gray-400
          transition-transform
          group-hover:translate-x-1
        "
      />
    </button>
  );
}
