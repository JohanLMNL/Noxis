'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, BellOff, Check } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export function NotificationToggle() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Vérifier si les notifications sont supportées
    setIsSupported('Notification' in window)
    
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Non supporté",
        description: "Les notifications ne sont pas supportées par ce navigateur.",
        variant: "destructive"
      })
      return
    }

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      
      if (result === 'granted') {
        toast({
          title: "Notifications activées",
          description: "Vous recevrez maintenant des notifications pour vos tâches.",
        })
        
        // Tester avec une notification
        new Notification('JMNL Productivity', {
          body: 'Les notifications sont maintenant activées !',
          icon: '/icons/icon-192.png',
          tag: 'test-notification'
        })
      } else {
        toast({
          title: "Notifications refusées",
          description: "Vous pouvez les activer plus tard dans les paramètres du navigateur.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'activer les notifications.",
        variant: "destructive"
      })
    }
  }

  const testNotification = () => {
    if (permission === 'granted') {
      new Notification('Test JMNL Productivity', {
        body: 'Ceci est une notification de test !',
        icon: '/icons/icon-192.png',
        tag: 'test-notification',
        requireInteraction: false
      })
      
      toast({
        title: "Notification envoyée",
        description: "Une notification de test a été envoyée.",
      })
    }
  }

  if (!isSupported) {
    return (
      <Card className="card-glow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BellOff className="h-5 w-5" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les notifications ne sont pas supportées par ce navigateur.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notifications</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Notifications push</Label>
            <p className="text-sm text-muted-foreground">
              Recevez des rappels pour vos tâches importantes
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            {permission === 'granted' && (
              <Check className="h-4 w-4 text-green-500" />
            )}
            <Switch 
              checked={permission === 'granted'}
              onCheckedChange={(checked) => {
                if (checked && permission !== 'granted') {
                  requestPermission()
                }
              }}
            />
          </div>
        </div>

        {permission === 'default' && (
          <Button onClick={requestPermission} className="w-full">
            <Bell className="mr-2 h-4 w-4" />
            Activer les notifications
          </Button>
        )}

        {permission === 'granted' && (
          <Button variant="outline" onClick={testNotification} className="w-full">
            Tester les notifications
          </Button>
        )}

        {permission === 'denied' && (
          <div className="text-sm text-muted-foreground">
            <p>Les notifications ont été refusées.</p>
            <p>Vous pouvez les activer dans les paramètres de votre navigateur.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
