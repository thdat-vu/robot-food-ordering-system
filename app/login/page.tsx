import { LoginForm } from "@/components/login/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/elegant-restaurant-interior-with-warm-lighting-and.jpg"
          alt="Restaurant interior"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 text-white">
          <h2 className="text-4xl font-serif font-bold mb-3 text-balance">
            Trải nghiệm ẩm thực tuyệt hảo
          </h2>
          <p className="text-lg text-white/90 max-w-md leading-relaxed">
            Tham gia chúng tôi để trải nghiệm một hành trình ăn uống không thể
            quên nơi mỗi món ăn kể một câu chuyện
            story
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
