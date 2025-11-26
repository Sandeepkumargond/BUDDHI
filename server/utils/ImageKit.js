import ImageKit from "imagekit";
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const getFileIdFromUrl = async (url) => {
    try {
        if (!url) return null;

        // Extract the file path from the full URL
        const base = process.env.IMAGEKIT_URL_ENDPOINT;

        // Remove the base URL to get just the file path
        const filePath = url.replace(base, '');

        // console.log("Original URL:", url);
        // console.log("File Path:", filePath);

        // getFileDetails expects fileId, not URL
        // Use listFiles to search by name instead
        const urlParts = url.split('/');
        const filename = urlParts[urlParts.length - 1];

        // console.log("Searching for filename:", filename);

        const files = await imagekit.listFiles({
            searchQuery: `name="${filename}"`
        });

        if (files && files.length > 0) {
            // console.log("✅ File found:");
            // console.log(files[0]);
            // console.log(`\n🆔 File ID: ${files[0].fileId}`);
            return files[0].fileId;
        }

        // console.log("❌ File not found");
        return null;

    } catch (error) {
        console.error("❌ Error fetching file details:", error.message);
        return null;
    }
}


// Delete file from ImageKit
const deleteFromImageKit = async (fileId) => {
    try {
        if (!fileId) return { error: true, message: "No fileId provided" };

        await imagekit.deleteFile(fileId);

        return {
            error: false,
            message: "File deleted successfully"
        };
    } catch (error) {
        return {
            error: true,
            message: error.message || "Error deleting file from ImageKit"
        };
    }
};

const uploadImageOnImageKit = async (localFilePath, userId) => {
    try {
        if (!localFilePath) return null;

        // Read file and convert to base64
        const fileBuffer = fs.readFileSync(localFilePath);
        const base64File = fileBuffer.toString('base64');

        const response = await imagekit.upload({
            file: base64File,
            fileName: `${userId}_${Date.now()}`,
            folder: '/Buddhi_archives/',
        });

        // Delete local file after successful upload
        fs.unlinkSync(localFilePath);

        return {
            error: false,
            url: response.url,
            fileId: response.fileId
        };

    } catch (error) {
        // Delete local file even if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return {
            error: true,
            message: error.message || "Error uploading image to ImageKit"
        };
    }
}

// Upload notice attachment to ImageKit
const uploadNoticeAttachment = async (localFilePath, originalFileName) => {
    try {
        // console.log('🔄 uploadNoticeAttachment called with:', { localFilePath, originalFileName });
        
        if (!localFilePath) {
            console.error('❌ No file path provided');
            return { error: true, message: "No file path provided" };
        }

        // Check if file exists
        if (!fs.existsSync(localFilePath)) {
            console.error('❌ File does not exist at path:', localFilePath);
            return { error: true, message: "File not found at specified path" };
        }

        // Read file and convert to base64
        // console.log('📄 Reading file...');
        const fileBuffer = fs.readFileSync(localFilePath);
        const base64File = fileBuffer.toString('base64');
        // console.log('✅ File read successfully, size:', fileBuffer.length, 'bytes');

        // Generate unique filename with timestamp
        const fileExtension = originalFileName.split('.').pop();
        const fileName = `notice_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
        // console.log('📝 Generated filename:', fileName);

        // console.log('🚀 Starting ImageKit upload...');
        const response = await imagekit.upload({
            file: base64File,
            fileName: fileName,
            folder: '/Buddhi_archives/notices/',
            tags: ['notice', 'attachment', `original:${originalFileName}`, `uploaded:${new Date().toISOString().split('T')[0]}`]
        });

        // console.log('✅ ImageKit upload successful:', {
        //     url: response.url,
        //     fileId: response.fileId,
        //     name: response.name
        // });

        // Delete local file after successful upload
        fs.unlinkSync(localFilePath);
        // console.log('🗑️ Local file deleted');

        return {
            error: false,
            url: response.url,
            fileId: response.fileId,
            fileName: response.name,
            size: response.size,
            originalName: originalFileName
        };

    } catch (error) {
        console.error('❌ ImageKit upload error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        
        // Delete local file even if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log('🗑️ Local file deleted after error');
        }
        
        return {
            error: true,
            message: error.message || "Error uploading notice attachment to ImageKit"
        };
    }
}

export { uploadImageOnImageKit, deleteFromImageKit, getFileIdFromUrl, uploadNoticeAttachment };