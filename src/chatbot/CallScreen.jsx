import { useState } from "react";
import {
  ArrowLeft,
  Bot,
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  ShieldCheck,
  Volume2,
  VolumeX,
} from "lucide-react";

export default function CallScreen({ onBack }) {
  // States

  const [isMuted, setIsMuted] = useState(false);

  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  const [callStatus, setCallStatus] = useState("ringing");

  // END CALL

  const handleEndCall = () => {
    setCallStatus("ended");
  };

  // UI

  return (
    <div className="flex h-[570px] flex-col bg-slate-100">
      {/* HEADER */}

      <div className="flex items-center justify-between px-5 py-4">
        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={onBack}
          className="
            cursor-pointer
            rounded-full
            p-2
            text-gray-700
            transition
            hover:bg-slate-200
          "
          title="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* HEADER TITLE */}

        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-800">Call</h2>

          <p className="text-xs text-gray-500">You are now calling</p>
        </div>

        {/* RIGHT SPACER */}

        <div className="w-9" />
      </div>

      {/* MAIN CONTENT */}

      <div className="flex flex-1 flex-col items-center justify-center px-5">
        {/* AI AVATAR + GLOWING RINGS */}

        <div className="relative flex h-52 w-52 items-center justify-center">
          {/* OUTER RING */}

          <div
            className="
              absolute
              h-52
              w-52
              rounded-full
              border
              border-blue-200
            "
          />

          {/* MIDDLE RING */}

          <div
            className="
              absolute
              h-44
              w-44
              rounded-full
              border
              border-blue-200
            "
          />

          {/* INNER BLUE CIRCLE */}

          <div
            className="
              absolute
              h-36
              w-36
              rounded-full
              bg-blue-100
            "
          />

          {/* BOT */}

          <div
            className="
              relative
              flex
              h-28
              w-28
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-xl
            "
          >
            <Bot className="h-14 w-14 text-blue-500" />
          </div>
        </div>

        {/* CALLER INFORMATION */}

        <h2 className="mt-2 text-2xl font-bold text-gray-800">
          Barun's AI Assistant
        </h2>

        <p className="mt-2 text-sm text-gray-500">Admission Counsellor</p>

        {/* CALL STATUS */}

        <div className="mt-2 flex items-center gap-2">
          <span
            className={`
              h-3
              w-3
              rounded-full
              ${
                callStatus === "ringing"
                  ? "animate-pulse bg-green-500"
                  : "bg-gray-400"
              }
            `}
          />

          <span className="text-sm font-medium text-gray-600">
            {callStatus === "ringing" ? "Ringing..." : "Call Ended"}
          </span>
        </div>

        {/* SECURITY CARD */}

        <div
          className="
            mt-5
            w-full
            max-w-sm
            rounded-xl
            border
            border-blue-100
            bg-white
            px-4
            py-3
            shadow-sm
          "
        >
          <div className="flex items-center gap-3">
            {/* SHIELD */}

            <div
              className="
                rounded-full
                bg-blue-100
                p-2
              "
            >
              <ShieldCheck className="h-5 w-5 text-blue-500" />
            </div>

            {/* SECURITY TEXT */}

            <div>
              <p className="text-sm font-medium text-gray-800">
                Your call is secure and encrypted
              </p>

              <p className="mt-1 text-xs text-gray-500">
                We respect your privacy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CALL CONTROLS */}

      <div className="flex items-center justify-center gap-8 px-5 pb-8 mt-3">
        {/* MUTE */}

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`
              flex
              h-14
              w-14
              cursor-pointer
              items-center
              justify-center
              rounded-full
              shadow-md
              transition-all
              hover:scale-105
              ${isMuted ? "bg-blue-500 text-white" : "bg-white text-gray-700"}
            `}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <MicOff className="h-6 w-6" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </button>

          <p className="mt-2 text-xs text-gray-600">
            {isMuted ? "Unmute" : "Mute"}
          </p>
        </div>

        {/* END CALL */}

        <div className="text-center">
          <button
            type="button"
            onClick={handleEndCall}
            disabled={callStatus === "ended"}
            className="
              flex
              h-16
              w-16
              cursor-pointer
              items-center
              justify-center
              rounded-full
              bg-red-500
              text-white
              shadow-lg
              transition-all
              hover:scale-105
              hover:bg-red-600
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
            title="End Call"
          >
            {/* <PhoneOn className="h-7 w-7" /> */}
            <PhoneCall className="h-7 w-7" />
          </button>

          <p className="mt-2 text-xs text-gray-600">End Call</p>
        </div>

        {/* SPEAKER */}

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`
              flex
              h-14
              w-14
              cursor-pointer
              items-center
              justify-center
              rounded-full
              shadow-md
              transition-all
              hover:scale-105
              ${
                isSpeakerOn
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700"
              }
            `}
            title={isSpeakerOn ? "Turn speaker off" : "Turn speaker on"}
          >
            {isSpeakerOn ? (
              <Volume2 className="h-6 w-6" />
            ) : (
              <VolumeX className="h-6 w-6" />
            )}
          </button>

          <p className="mt-2 text-xs text-gray-600">Speaker</p>
        </div>
      </div>
    </div>
  );
}
