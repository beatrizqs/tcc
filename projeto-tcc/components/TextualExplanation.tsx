import { AnimatePresence, motion } from "framer-motion";
import { X } from "phosphor-react";

export default function TextualExplanation({
  explanation,
  onClose,
  isOpen,
}: {
  explanation: string;
  onClose: () => void;
  isOpen: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Container centralizador */}
          <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Modal */}
            <motion.div
              className="w-[80%] rounded-md overflow-y-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className=" flex flex-col gap-5 bg-white p-5 rounded-md h-full">
                <div className="flex flex-row justify-between items-center">
                  <h2 className="font-title text-blue text-lg">Explicação</h2>
                  <X
                    size={24}
                    className="hover:text-red-500 cursor-pointer transition ease-in-out"
                    onClick={onClose}
                  />
                </div>
                <p className="font-common text-base text-justify py-2 pr-2 whitespace-pre-line overflow-auto max-h-[60vh]">
                  {explanation}
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
