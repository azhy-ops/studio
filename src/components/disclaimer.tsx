
"use client";

import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from './ui/card';

const Disclaimer = () => {
    return (
        <Card className="bg-[#fffbe6] border-[#cc3300] mt-8">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-[#cc3300] mt-0.5" />
                    <div className='flex-1'>
                        <p className="text-[#cc3300] text-sm font-semibold">
                            Gameplay vs. Stats
                        </p>
                        <p className="text-[#cc3300]/90 text-xs">
                           Some weapons may behave differently in actual gameplay than their listed stats suggest due to factors like recoil patterns, available attachments, or handling animations.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default Disclaimer;
