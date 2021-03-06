using System;
using System.Collections.Generic;
using System.Diagnostics;

public class PacketManager
{
  public delegate void RecvCallback(int packet_id, PacketReader content);
  protected PacketConnection _Connection;
  protected Dictionary<int, RecvCallback> _Mapper;

  public bool Connected { get { return _Connection.Connected; } }
  public bool Failed { get { return _Connection.Failed; } }

  private class InternalPacketListener : PacketListener
  {
    private PacketManager _PacketManager;

    public InternalPacketListener(PacketManager pm)
    {
      _PacketManager = pm;
    }

    public void ConnectionMade(PacketConnection conn)
    {
      _PacketManager.OnConnected();
    }

    public void ConnectionFailed(PacketConnection conn)
    {
      // todo: display error
	  _PacketManager.OnFailed();
    }

    public void ConnectionLost(PacketConnection conn)
    {
	
	UnityEngine.Debug.Log("------------------------------ ConnectionLost");
      _PacketManager.OnDisconnected();
    }

    public void PacketReceived(PacketConnection conn, int packet_id, byte[] content)
    {
      _PacketManager.PacketReceived(packet_id, content);
    }
  }

  public PacketManager()
  {
    _Connection = new PacketConnection();
    _Connection.listener = new InternalPacketListener(this);

    _Mapper = new Dictionary<int, RecvCallback>();
  }

  public void Connect(string host, int port)
  {
    _Connection.Connect(host, port);
  }


  public void Disconnect()
  {
    _Connection.Disconnect();
  }

  protected virtual void OnConnected() { }
  protected virtual void OnDisconnected() { }
  protected virtual void OnFailed() { }

  public void ProcessEvents()
  {
    _Connection.ProcessEvents();
  }

  protected void Send(int packet_id)
  {
    _Connection.SendPacket(packet_id, null, 0, 0);
  }

  protected PacketWriter BeginSend(int packet_id)
  {
    return _Connection.BeginSend(packet_id);
  }

  protected void EndSend()
  {
    _Connection.EndSend();
  }

  private void PacketReceived(int packet_id, byte[] data)
  {
        //	UnityEngine.MonoBehaviour.print("------------------ packet : " + packet_id );

    PacketReader p = new PacketReader(data);
    RecvCallback cb;
    if (_Mapper.TryGetValue(packet_id, out cb))
      cb(packet_id, p);
    else
      RecvDefault(packet_id, p);
  }

  //////////////////////////////////////////////////////////////////////////
  // Recv Function
  //////////////////////////////////////////////////////////////////////////

  private void RecvDefault(int packet_id, PacketReader pr)
  {
    UnityEngine.MonoBehaviour.print("packet " + packet_id + " not found!!!");

    Debug.Assert(false);
  }
}
