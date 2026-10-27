package com.docuai.docuai.document.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class PDFPageRenderingService {

    public List<BufferedImage> renderPage(byte[] pdfBytes) throws IOException {
        List<BufferedImage> pageImages = new ArrayList<>();

        try(PDDocument document = Loader.loadPDF(pdfBytes)){
            PDFRenderer renderer = new PDFRenderer(document);

            for(int page = 0; page<document.getNumberOfPages();page++){
                BufferedImage image = renderer.renderImageWithDPI(
                        page,
                        150,
                        ImageType.RGB
                );
                pageImages.add(image);
            }
        }
        return pageImages;
    }

}
