import SimpleTemplate from "@/components/templates/SimpleTemplate";
import { sampleCv } from "@/data/sampleCv";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto flex w-full max-w-5xl justify-center">
        <SimpleTemplate cv={sampleCv} />
      </div>
    </main>
  );
}
