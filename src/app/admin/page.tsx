"use client";
import AdminCard from "@/components/admin/AdminCard";
import PhotoUploaderPretty from "@/components/PhotoUploaderPretty";
import SettingsPretty from "@/components/SettingsPretty";
import PhotosGrid from "@/components/PhotosGrid";

export default function AdminPage() {
    return (
        <>
            <div id="upload">
                <AdminCard title="Upload ảnh cưới">
                    <PhotoUploaderPretty />
                </AdminCard>
            </div>

            <div id="settings">
                <AdminCard title="Thiết lập thiệp">
                    <SettingsPretty />
                </AdminCard>
            </div>

            <div id="photos">
                <AdminCard title="Quản lý ảnh">
                    <PhotosGrid />
                </AdminCard>
            </div>
        </>
    );
}
