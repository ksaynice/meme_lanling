'use client';

import React, { useState, useEffect } from 'react';

interface FilenameEditorProps {
    image: {
        id: number;
        filename: string;
    };
    onUpdate: (newName: string) => void;
}

const FilenameEditor = ({ image, onUpdate }: FilenameEditorProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(image.filename);
    const [saving, setSaving] = useState(false);

    // Sync input if image changes
    useEffect(() => {
        setName(image.filename);
        setIsEditing(false);
    }, [image]);

    const handleSave = async () => {
        if (!name.trim() || name === image.filename) {
            setIsEditing(false);
            return;
        }

        setSaving(true);
        try {
            const res = await fetch(`/api/image/${image.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: name })
            });

            if (res.ok) {
                onUpdate(name);
                setIsEditing(false);
            } else {
                alert('Update failed');
            }
        } catch (e) {
            console.error(e);
            alert('Update failed');
        } finally {
            setSaving(false);
        }
    };

    if (isEditing) {
        return (
            <div className="editor-container">
                <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="editor-input"
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                />
                <button onClick={handleSave} disabled={saving} className="btn-icon btn-confirm">
                    {saving ? '...' : '✓'}
                </button>
                <button onClick={() => setIsEditing(false)} className="btn-icon btn-cancel">✕</button>
            </div>
        );
    }

    return (
        <div className="title-display group/title" onClick={() => setIsEditing(true)}>
            <h3 className="title-text">{image.filename}</h3>
            <span className="edit-icon">✏️</span>
        </div>
    );
};

export default FilenameEditor;
