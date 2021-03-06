using System;

public interface PacketListener
{
  void ConnectionMade(PacketConnection conn);
  void ConnectionFailed(PacketConnection conn);
  void ConnectionLost(PacketConnection conn);
  void PacketReceived(PacketConnection conn, int packet_id, byte[] content);
}
