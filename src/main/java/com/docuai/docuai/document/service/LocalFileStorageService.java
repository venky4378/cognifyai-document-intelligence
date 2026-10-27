
package com.docuai.docuai.document.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class LocalFileStorageService {

    private final Path storageDirectory;

    public LocalFileStorageService(
            @Value("${app.document.storage-dir}") String storageDir)
            throws IOException {

        this.storageDirectory = Paths.get(storageDir)
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(storageDirectory);
    }

    public String store(MultipartFile file) throws IOException {

        String storedName = UUID.randomUUID() + ".pdf";

        Path target = storageDirectory.resolve(storedName)
                .normalize();

        if (!target.startsWith(storageDirectory)) {
            throw new IOException("Invalid file path");
        }

        Files.copy(file.getInputStream(), target);

        return target.toString();
    }
}
