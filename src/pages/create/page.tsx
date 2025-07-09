import { useState } from "react";
import { Upload, Frame } from "lucide-react";

const SIZES = [
  { id: "A4", name: "A4", dimensions: "210 × 297 mm", price: 29.99 },
  { id: "A3", name: "A3", dimensions: "297 × 420 mm", price: 39.99 },
  { id: "A2", name: "A2", dimensions: "420 × 594 mm", price: 49.99 },
  { id: "A1", name: "A1", dimensions: "594 × 841 mm", price: 69.99 },
  { id: "A0", name: "A0", dimensions: "841 × 1189 mm", price: 89.99 },
];

const FRAMES = [
  { id: "none", name: "No Frame", price: 0 },
  { id: "standard", name: "Standard Frame", price: 19.99 },
  { id: "premium", name: "Premium Frame", price: 39.99 },
];

export default function CreatePage() {
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
  const [image, setImage] = useState<string | null>(null);

  const totalPrice = selectedSize.price + selectedFrame.price;

  return (
    <div className="min-h-screen py-12 bg-cream-50">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center text-charcoal-300 mb-12">
          Create Your Custom ChartedArt Kit
        </h1>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">Upload Your Photo</h2>
            <div className="border-2 border-dashed border-sage-200 rounded-lg p-8">
              {image ? (
                <div className="relative aspect-square">
                  <img
                    src={image}
                    alt="Uploaded photo"
                    className="object-cover rounded-lg w-full h-full"
                  />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-cream-100"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 text-sage-300 mx-auto mb-4" />
                  <p className="text-charcoal-300 mb-2">
                    Drag and drop your photo here, or click to browse
                  </p>
                  <p className="text-sm text-charcoal-200">
                    Supported formats: JPG, PNG (max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
              <h2 className="text-2xl font-semibold mb-6">Choose Your Size</h2>
              <div className="space-y-4">
                {SIZES.map((size) => (
                  <div
                    key={size.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedSize.id === size.id
                        ? "bg-sage-100 border-2 border-sage-300"
                        : "border-2 border-transparent hover:bg-cream-50"
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{size.name}</h3>
                        <p className="text-sm text-charcoal-200">
                          {size.dimensions}
                        </p>
                      </div>
                      <div className="text-lg font-semibold">${size.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
              <h2 className="text-2xl font-semibold mb-6">Select Framing</h2>
              <div className="space-y-4">
                {FRAMES.map((frame) => (
                  <div
                    key={frame.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedFrame.id === frame.id
                        ? "bg-sage-100 border-2 border-sage-300"
                        : "border-2 border-transparent hover:bg-cream-50"
                    }`}
                    onClick={() => setSelectedFrame(frame)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <Frame className="w-5 h-5 text-sage-400" />
                        <h3 className="font-semibold">{frame.name}</h3>
                      </div>
                      <div className="text-lg font-semibold">
                        {frame.price === 0 ? "Free" : `$${frame.price}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Total</h2>
                <div className="text-3xl font-bold text-sage-500">
                  ${totalPrice.toFixed(2)}
                </div>
              </div>
              <button
                className="w-full bg-sage-400 text-white py-4 rounded-lg text-lg font-semibold hover:bg-sage-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!image}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}