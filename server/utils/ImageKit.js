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

// Upload study material to ImageKit
const uploadStudyMaterial = async (file, metadata = {}) => {
    try {
        console.log('🔄 uploadStudyMaterial called with:', { 
            filePath: file.path, 
            originalName: file.originalname,
            size: file.size,
            metadata 
        });
        
        if (!file.path) {
            console.error('❌ No file path provided');
            return { error: true, message: "No file path provided" };
        }

        // Check if file exists
        if (!fs.existsSync(file.path)) {
            console.error('❌ File does not exist at path:', file.path);
            return { error: true, message: "File not found at specified path" };
        }

        // Read file and convert to base64
        console.log('📄 Reading study material file...');
        const fileBuffer = fs.readFileSync(file.path);
        const base64File = fileBuffer.toString('base64');
        console.log('✅ File read successfully, size:', fileBuffer.length, 'bytes');

        // Generate unique filename with metadata
        const fileExtension = file.originalname.split('.').pop();
        const sanitizedTitle = metadata.title ? metadata.title.replace(/[^a-zA-Z0-9]/g, '_') : 'material';
        const fileName = `${sanitizedTitle}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExtension}`;
        console.log('📝 Generated filename:', fileName);

        // Prepare tags for better organization
        const tags = [
            'study_material',
            metadata.subject && `subject:${metadata.subject}`,
            metadata.courseCode && `course:${metadata.courseCode}`,
            metadata.semester && `semester:${metadata.semester}`,
            metadata.branch && `branch:${metadata.branch}`,
            metadata.materialType && `type:${metadata.materialType}`,
            `uploaded:${new Date().toISOString().split('T')[0]}`,
            `original:${file.originalname}`
        ].filter(Boolean);

        console.log('🚀 Starting ImageKit upload for study material...');
        const response = await imagekit.upload({
            file: base64File,
            fileName: fileName,
            folder: '/Buddhi_archives/study_materials/',
            tags: tags
        });

        console.log('✅ ImageKit upload successful:', {
            url: response.url,
            fileId: response.fileId,
            name: response.name,
            size: response.size
        });

        // Delete local file after successful upload
        fs.unlinkSync(file.path);
        console.log('🗑️ Local file deleted');

        return {
            error: false,
            url: response.url,
            fileId: response.fileId,
            fileName: response.name,
            fileSize: response.size,
            originalName: file.originalname
        };

    } catch (error) {
        console.error('❌ ImageKit study material upload error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        // IMPORTANT: Do NOT delete local temp file on error.
        // The controller may perform a local fallback move to /public/submissions.
        // Leaving the temp file intact ensures fallback succeeds.
        
        return {
            error: true,
            message: error.message || "Error uploading study material to ImageKit"
        };
    }
};

// Delete study material from ImageKit
const deleteStudyMaterial = async (fileId) => {
    try {
        console.log('🗑️ Deleting study material from ImageKit:', fileId);
        
        if (!fileId) {
            return { error: true, message: "No fileId provided" };
        }

        await imagekit.deleteFile(fileId);
        console.log('✅ Study material deleted from ImageKit successfully');

        return {
            error: false,
            message: "Study material deleted successfully"
        };
    } catch (error) {
        console.error('❌ Error deleting study material:', error);
        return {
            error: true,
            message: error.message || "Error deleting study material from ImageKit"
        };
    }
};

export { 
    uploadImageOnImageKit, 
    deleteFromImageKit, 
    getFileIdFromUrl, 
    uploadNoticeAttachment,
    uploadStudyMaterial,
    deleteStudyMaterial 
};