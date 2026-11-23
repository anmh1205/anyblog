# Anyblog

Blog tiếng Việt về firmware và hệ thống nhúng. Giáo trình IVTS ở `docs/ivts/`, các bài blog ở `blog/` và trang chủ ở `src/pages/index.jsx`.

## Chạy trên máy

Yêu cầu Node.js 20 trở lên.

~~~sh
npm ci
npm start
~~~

Mở http://localhost:3000. Để kiểm tra bản production và các liên kết nội bộ, chạy `npm run build`. Kết quả build nằm trong `build/`.

## Cập nhật giáo trình

Các tệp Markdown trong `docs/ivts/` là nội dung của website. Nếu thay tiêu đề ngắn hoặc đường dẫn trên trang chủ, cập nhật `src/content.js` cùng với tệp bài tương ứng. Sidebar lấy thứ tự bài từ danh sách đó.

Site dùng Docusaurus 3.10.1. Manifest trong `.openai/hosting.json` trỏ tới bản build tĩnh. Có thể đặt biến môi trường `SITE_URL` khi xuất bản ở tên miền khác.

## Ảnh trang chủ

`static/img/firmware-bench.webp` là ảnh minh họa được tạo bằng ImageGen tích hợp.

<details>
<summary>Prompt tạo ảnh</summary>

> Create a photorealistic horizontal 4:3 editorial hero photograph for a Vietnamese embedded firmware engineering blog. A real-looking unbranded dark teal printed circuit board on a deep ink navy antistatic work mat, shown as a close angled overhead macro. Show a central matte black microcontroller, a few precision surface mount components, subtle copper test pads, and two slender oscilloscope probes approaching the board from the upper edge. PCB center at 55% x, 55% y, natural strong diagonal from lower left to upper right, all edges cropped organically. Carefully art-directed cool blue reflections and one tiny warm amber LED, high detail, believable PCB manufacturing textures, dark legible editorial photography with selective focus, strong visual depth, faint instrument shapes in the background. No brand, logos, superimposed graphics, text, visible part markings, humans, overlay labels or borders. This is an illustrative bench detail, not a product render or schematic.

</details>
