package com.storyapp.storyapp.service;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Service
public class ExcelTemplateService {

    public byte[] generateTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            // Header cell style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Sheet 1: STORY
            Sheet storySheet = workbook.createSheet("STORY");
            Row storyHeader = storySheet.createRow(0);
            String[] storyColumns = {"external_id", "title", "author", "description", "cover_url", "status"};
            for (int i = 0; i < storyColumns.length; i++) {
                Cell cell = storyHeader.createCell(i);
                cell.setCellValue(storyColumns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Sample stories
            Row s1 = storySheet.createRow(1);
            s1.createCell(0).setCellValue("TR001");
            s1.createCell(1).setCellValue("Đấu Phá Thương Khung");
            s1.createCell(2).setCellValue("Thiên Tằm Thổ Đậu");
            s1.createCell(3).setCellValue("Một thế giới thuộc về Đấu Khí...");
            s1.createCell(4).setCellValue("https://example.com/cover1.jpg");
            s1.createCell(5).setCellValue("ONGOING");

            Row s2 = storySheet.createRow(2);
            s2.createCell(0).setCellValue("TR002");
            s2.createCell(1).setCellValue("Võ Động Càn Khôn");
            s2.createCell(2).setCellValue("Thiên Tằm Thổ Đậu");
            s2.createCell(3).setCellValue("Đồ Thần Hóa Thần...");
            s2.createCell(4).setCellValue("https://example.com/cover2.jpg");
            s2.createCell(5).setCellValue("COMPLETED");

            for (int i = 0; i < storyColumns.length; i++) {
                storySheet.autoSizeColumn(i);
            }

            // Sheet 2: CHAPTERS
            Sheet chapterSheet = workbook.createSheet("CHAPTERS");
            Row chapterHeader = chapterSheet.createRow(0);
            String[] chapterColumns = {"external_story_id", "chapter_number", "title", "content", "access_level"};
            for (int i = 0; i < chapterColumns.length; i++) {
                Cell cell = chapterHeader.createCell(i);
                cell.setCellValue(chapterColumns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Sample chapters
            Row c1 = chapterSheet.createRow(1);
            c1.createCell(0).setCellValue("TR001");
            c1.createCell(1).setCellValue(1);
            c1.createCell(2).setCellValue("Chương 1: Tiêu Nhược");
            c1.createCell(3).setCellValue("Đấu khí tam đoạn! Nhìn thấy năm chữ đỏ chói lọi...");
            c1.createCell(4).setCellValue("FREE");

            Row c2 = chapterSheet.createRow(2);
            c2.createCell(0).setCellValue("TR001");
            c2.createCell(1).setCellValue(2);
            c2.createCell(2).setCellValue("Chương 2: Đấu Khí Đại Lục");
            c2.createCell(3).setCellValue("Nội dung chương 2...");
            c2.createCell(4).setCellValue("FREE");

            Row c3 = chapterSheet.createRow(3);
            c3.createCell(0).setCellValue("TR001");
            c3.createCell(1).setCellValue(3);
            c3.createCell(2).setCellValue("Chương 3: Khách Quý");
            c3.createCell(3).setCellValue("Nội dung chương 3 VIP...");
            c3.createCell(4).setCellValue("VIP");

            for (int i = 0; i < chapterColumns.length; i++) {
                chapterSheet.autoSizeColumn(i);
            }

            // Sheet 3: README
            Sheet readmeSheet = workbook.createSheet("README");
            Row readmeTitle = readmeSheet.createRow(0);
            Cell readmeTitleCell = readmeTitle.createCell(0);
            readmeTitleCell.setCellValue("HƯỚNG DẪN NHẬP DỮ LIỆU TRUYỆN & CHƯƠNG (EXCEL IMPORT)");

            String[] instructions = {
                "1. File Excel phải có 2 Sheet tên đúng chính xác: STORY và CHAPTERS.",
                "2. Sheet STORY bao gồm các cột: external_id, title, author, description, cover_url, status.",
                "   - external_id: Mã nhận diện duy nhất của truyện (bắt buộc, ví dụ: TR001).",
                "   - title: Tên truyện (bắt buộc).",
                "   - status: ONGOING (Đang ra) hoặc COMPLETED (Hoàn thành). Mặc định là ONGOING.",
                "3. Sheet CHAPTERS bao gồm các cột: external_story_id, chapter_number, title, content, access_level.",
                "   - external_story_id: Mã truyện tương ứng bên sheet STORY (bắt buộc).",
                "   - chapter_number: Số thứ tự chương (số nguyên > 0, bắt buộc).",
                "   - title: Tên chương (bắt buộc).",
                "   - content: Nội dung chữ của chương (bắt buộc).",
                "   - access_level: FREE, PUBLIC, hoặc VIP. Mặc định là PUBLIC/FREE.",
                "4. Quy tắc kiểm tra trùng lặp:",
                "   - Nếu external_id đã tồn tại trong CSDL -> Truyện đã tồn tại (EXISTING).",
                "   - Nếu tên truyện trùng khớp khi bỏ dấu/khoảng trắng -> Cảnh báo trùng lặp (POSSIBLE_DUPLICATE).",
                "   - Số chương (chapter_number) của cùng một truyện không được trùng nhau.",
                "5. Admin có thể chọn chính sách xử lý khi Commit:",
                "   - Story Policy: KEEP (Giữ thông tin cũ) hoặc UPDATE (Cập nhật tiêu đề, tác giả, mô tả từ file).",
                "   - Chapter Policy: SKIP (Bỏ qua chương đã có) hoặc UPDATE (Ghi đè nội dung chương cũ)."
            };

            for (int i = 0; i < instructions.length; i++) {
                Row row = readmeSheet.createRow(i + 2);
                row.createCell(0).setCellValue(instructions[i]);
            }
            readmeSheet.autoSizeColumn(0);

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();
        }
    }
}
